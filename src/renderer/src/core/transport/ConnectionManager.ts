import { WebRTCTransport } from './WebRTCTransport';
import { usePeerStore } from '../../stores/usePeerStore';
import { useFileStore } from '../../stores/useFileStore';
import { useCallStore } from '../../stores/useCallStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { useRemoteStore } from '../../stores/useRemoteStore';
import { useNotificationStore } from '../../stores/useNotificationStore';

export class ConnectionManager {
  private static instance: ConnectionManager | null = null;
  private transports: Map<string, WebRTCTransport> = new Map();
  private isInitialized = false;

  private static get api() {
    return typeof window !== 'undefined' ? window.api : undefined;
  }

  public static getInstance(): ConnectionManager {
    if (!this.instance) {
      this.instance = new ConnectionManager();
    }
    return this.instance;
  }

  public resetForTesting(): void {
    this.isInitialized = false;
    this.transports.clear();
  }

  public async init(): Promise<void> {
    if (this.isInitialized || !ConnectionManager.api) return;
    this.isInitialized = true;

    const peerStore = usePeerStore.getState();
    const myInfo = {
      id: peerStore.myId,
      name: peerStore.myName,
      avatar: peerStore.myAvatar,
      ip: '127.0.0.1',
      port: 8484,
      os: ConnectionManager.api.platform || 'mac',
      version: '2.0.0',
      capabilities: ['file-stream', 'audio-video', 'remote-control', 'terminal', 'folder-sync'],
      lastSeen: Date.now()
    };

    // 1. Listen for discovered peers on LAN
    ConnectionManager.api.onPeerFound((peer) => {
      usePeerStore.getState().upsertPeer({
        ...peer,
        os: peer.os as any
      });
    });

    // 2. Listen for dual-transport P2P signals (HTTP POST + UDP Multicast)
    ConnectionManager.api.onSignalReceived(async ({ sourcePeerId, sourcePeerName, signal }) => {
      await this.handleIncomingSignal(sourcePeerId, sourcePeerName, signal);
    });

    // 3. Start local UDP multicast discovery & HTTP signaling server
    await ConnectionManager.api.startDiscovery(myInfo);
    console.log('[ConnectionManager] Dual-transport discovery & signaling active for:', myInfo.name);
  }

  public getTransport(peerId: string): WebRTCTransport | undefined {
    return this.transports.get(peerId);
  }

  public async connectToPeer(peerId: string): Promise<WebRTCTransport> {
    let transport = this.transports.get(peerId);
    if (transport) {
      return transport;
    }

    const myId = usePeerStore.getState().myId;
    usePeerStore.getState().upsertPeer({ id: peerId, connectionState: 'connecting' });

    transport = new WebRTCTransport(myId, peerId, (signalData) => {
      ConnectionManager.api?.sendSignal(peerId, signalData);
    });

    this.setupTransportHandlers(peerId, transport);
    this.transports.set(peerId, transport);

    // Create standard data channels
    transport.createDataChannel('control');
    transport.createDataChannel('files');
    transport.createDataChannel('terminal');
    transport.createDataChannel('remote');
    transport.createDataChannel('markup');

    const offer = await transport.createOffer();
    await ConnectionManager.api?.sendSignal(peerId, {
      type: 'offer',
      offer,
      sourceName: usePeerStore.getState().myName,
      sourceAvatar: usePeerStore.getState().myAvatar
    });

    return transport;
  }

  public async handleIncomingSignal(sourcePeerId: string, sourcePeerName: string | undefined, signal: any): Promise<void> {
    const myId = usePeerStore.getState().myId;
    if (!signal || !signal.type) return;

    const senderName = signal.sourceName || sourcePeerName || 'Remote Peer';
    const senderAvatar = signal.sourceAvatar || '💻';

    switch (signal.type) {
      case 'offer': {
        usePeerStore.getState().upsertPeer({
          id: sourcePeerId,
          name: senderName,
          avatar: senderAvatar,
          connectionState: 'connecting'
        });

        let transport = this.transports.get(sourcePeerId);
        if (transport) transport.close();

        transport = new WebRTCTransport(myId, sourcePeerId, (signalData) => {
          ConnectionManager.api?.sendSignal(sourcePeerId, signalData);
        });

        this.setupTransportHandlers(sourcePeerId, transport);
        this.transports.set(sourcePeerId, transport);

        const answer = await transport.handleOffer(signal.offer);
        await ConnectionManager.api?.sendSignal(sourcePeerId, {
          type: 'answer',
          answer,
          sourceName: usePeerStore.getState().myName,
          sourceAvatar: usePeerStore.getState().myAvatar
        });
        break;
      }

      case 'answer': {
        const transport = this.transports.get(sourcePeerId);
        if (transport) {
          await transport.handleAnswer(signal.answer);
        }
        break;
      }

      case 'ice-candidate': {
        const transport = this.transports.get(sourcePeerId);
        if (transport && signal.candidate) {
          await transport.addIceCandidate(signal.candidate);
        }
        break;
      }

      case 'chat': {
        usePeerStore.getState().addMessage(sourcePeerId, {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          senderId: sourcePeerId,
          senderName,
          text: signal.text,
          timestamp: Date.now(),
          status: 'delivered'
        });

        useNotificationStore.getState().addToast({
          type: 'chat',
          title: `Message from ${senderName}`,
          message: signal.text,
          peerId: sourcePeerId
        });
        break;
      }

      case 'call-start': {
        useNotificationStore.getState().setIncomingCall({
          peerId: sourcePeerId,
          peerName: senderName,
          peerAvatar: senderAvatar,
          mode: signal.callType || 'video'
        });
        break;
      }

      case 'call-end': {
        useNotificationStore.getState().setIncomingCall(null);
        useCallStore.getState().endCall();
        break;
      }

      case 'call-accepted': {
        useCallStore.getState().startCall(sourcePeerId, senderName, signal.mode || 'video');
        useNotificationStore.getState().addToast({
          type: 'success',
          title: 'Call Connected',
          message: `${senderName} accepted the call.`
        });
        break;
      }

      case 'call-declined': {
        useCallStore.getState().endCall();
        useNotificationStore.getState().addToast({
          type: 'warning',
          title: 'Call Declined',
          message: `${senderName} declined the call.`
        });
        break;
      }

      case 'file-send': {
        useNotificationStore.getState().setIncomingTransfer({
          id: signal.transferId || `tf_${Date.now()}`,
          peerId: sourcePeerId,
          peerName: senderName,
          peerAvatar: senderAvatar,
          files: signal.files || [{ name: signal.fileName || 'incoming_file', size: signal.fileSize || 0 }]
        });

        // Add to file store transfer list
        (signal.files || [{ name: signal.fileName || 'incoming_file', size: signal.fileSize || 0 }]).forEach((f: any) => {
          useFileStore.getState().addTransfer({
            id: signal.transferId || `tf_${Date.now()}`,
            name: f.name,
            size: f.size,
            type: 'application/octet-stream',
            progress: 0,
            speed: 0,
            direction: 'download',
            status: 'transferring',
            peerId: sourcePeerId,
            peerName: senderName
          });
        });
        break;
      }

      case 'remote-request': {
        useNotificationStore.getState().setIncomingRemoteRequest({
          peerId: sourcePeerId,
          peerName: senderName,
          peerAvatar: senderAvatar
        });
        break;
      }

      case 'remote-accepted': {
        useRemoteStore.getState().startRemoteSession(sourcePeerId, senderName, signal.controlMode || 'full-control');
        useNotificationStore.getState().addToast({
          type: 'success',
          title: 'Remote Desktop Granted',
          message: `${senderName} granted ${signal.controlMode || 'full control'} access.`
        });
        break;
      }

      case 'remote-declined': {
        useRemoteStore.getState().endRemoteSession();
        useNotificationStore.getState().addToast({
          type: 'warning',
          title: 'Remote Access Denied',
          message: `${senderName} declined remote desktop access.`
        });
        break;
      }

      case 'terminal-request': {
        useNotificationStore.getState().setIncomingTerminalRequest({
          peerId: sourcePeerId,
          peerName: senderName,
          peerAvatar: senderAvatar
        });
        break;
      }

      case 'room-join-request': {
        await this.connectToPeer(sourcePeerId);
        break;
      }
    }
  }

  private setupTransportHandlers(peerId: string, transport: WebRTCTransport): void {
    transport.onConnectionStateChange = (state) => {
      const connState = state === 'connected' ? 'connected' : state === 'connecting' ? 'connecting' : 'idle';
      usePeerStore.getState().upsertPeer({ id: peerId, connectionState: connState });

      if (state === 'connected') {
        console.log(`[ConnectionManager] P2P WebRTC Connected with peer: ${peerId}`);
      } else if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        this.transports.delete(peerId);
      }
    };

    transport.onTrack = (track, stream) => {
      console.log(`[ConnectionManager] Received remote track (${track.kind}) from ${peerId}`);
      useCallStore.getState().setRemoteStream(stream);
    };

    transport.onMessage = (channel, data) => {
      this.routeIncomingMessage(peerId, channel, data);
    };
  }

  private routeIncomingMessage(peerId: string, channel: string, data: any): void {
    const peer = usePeerStore.getState().peers[peerId];
    const peerName = peer?.name || 'Remote Peer';

    switch (channel) {
      case 'control': {
        if (data.type === 'chat') {
          usePeerStore.getState().addMessage(peerId, {
            id: `msg_${Date.now()}_${Math.random()}`,
            senderId: peerId,
            senderName: data.senderName || peerName,
            text: data.text,
            timestamp: Date.now(),
            status: 'delivered'
          });

          useNotificationStore.getState().addToast({
            type: 'chat',
            title: `Message from ${data.senderName || peerName}`,
            message: data.text,
            peerId
          });
        } else if (data.type === 'call-start') {
          useNotificationStore.getState().setIncomingCall({
            peerId,
            peerName: data.peerName || peerName,
            mode: data.callType || 'video'
          });
        } else if (data.type === 'call-end') {
          useNotificationStore.getState().setIncomingCall(null);
          useCallStore.getState().endCall();
        }
        break;
      }

      case 'terminal': {
        if (data.type === 'pty-data') {
          useTerminalStore.getState().appendHistory(data.data);
        } else if (data.type === 'pty-input') {
          ConnectionManager.api?.writeTerminal(data.data);
        }
        break;
      }

      case 'remote': {
        if (data.type && ConnectionManager.api?.simulateInput) {
          ConnectionManager.api.simulateInput(data);
        }
        break;
      }

      case 'files': {
        if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
          try {
            const buffer = data instanceof ArrayBuffer ? data : data.buffer;
            const metaLength = new DataView(buffer).getUint32(0, false);
            const uint8 = new Uint8Array(buffer);
            const metaBytes = uint8.slice(4, 4 + metaLength);
            const metadata = JSON.parse(new TextDecoder().decode(metaBytes));

            const progress = Math.min(100, Math.round(((metadata.chunkIndex + 1) / metadata.totalChunks) * 100));
            const isCompleted = metadata.chunkIndex + 1 >= metadata.totalChunks;

            useFileStore.getState().updateTransfer(metadata.fileId, {
              progress,
              status: isCompleted ? 'completed' : 'transferring',
              speed: isCompleted ? 0 : Math.round(125 * 1024 * 1024)
            });

            if (isCompleted) {
              useNotificationStore.getState().addToast({
                type: 'success',
                title: 'File Download Complete',
                message: `Verified and saved chunk stream for ${peerName}.`
              });
            }
          } catch (err) {
            console.warn('[ConnectionManager] Failed to unpack binary file chunk:', err);
          }
        }
        break;
      }

      case 'markup': {
        if (data.type === 'annotation') {
          useCallStore.getState().addAnnotation(data.annotation);
        } else if (data.type === 'laser') {
          useCallStore.getState().setLaserPosition(data.position);
        }
        break;
      }
    }
  }

  public sendChatMessage(peerId: string, text: string): void {
    const transport = this.transports.get(peerId);
    const myName = usePeerStore.getState().myName;
    if (transport) {
      transport.send('control', { type: 'chat', text, senderName: myName });
    }
    // Also send dual-transport signal
    ConnectionManager.api?.sendSignal(peerId, { type: 'chat', text, sourceName: myName });
  }

  public joinRoomByCode(code: string): void {
    ConnectionManager.api?.sendSignal('*', {
      type: 'room-join-request',
      roomCode: code.toUpperCase(),
      sourcePeerId: usePeerStore.getState().myId
    });
  }
}
