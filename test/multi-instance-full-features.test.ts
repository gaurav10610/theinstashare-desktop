import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager } from '../src/renderer/src/core/transport/ConnectionManager';
import { usePeerStore } from '../src/renderer/src/stores/usePeerStore';
import { useCallStore } from '../src/renderer/src/stores/useCallStore';
import { useFileStore } from '../src/renderer/src/stores/useFileStore';
import { useRemoteStore } from '../src/renderer/src/stores/useRemoteStore';
import { useTerminalStore } from '../src/renderer/src/stores/useTerminalStore';
import { useNotificationStore } from '../src/renderer/src/stores/useNotificationStore';
import { calculateChunkHash } from '../src/renderer/src/core/crypto/hashing';

describe('Exhaustive Multi-Instance Feature-by-Feature Integration Suite', () => {
  beforeEach(() => {
    // Reset all stores
    usePeerStore.setState({
      myId: 'peer_alice_local',
      myName: 'Alice (MacBook)',
      myAvatar: '🦊',
      peers: {},
      messages: {}
    });

    useCallStore.setState({
      isActive: false,
      peerId: null,
      peerName: null,
      mode: 'video'
    });

    useFileStore.setState({
      transfers: {}
    });

    useRemoteStore.setState({
      isActive: false,
      peerId: null,
      peerName: null
    });

    useTerminalStore.setState({
      isActive: false,
      peerId: null,
      peerName: null,
      history: []
    });

    useNotificationStore.setState({
      incomingCall: null,
      incomingTransfer: null,
      incomingRemoteRequest: null,
      incomingTerminalRequest: null,
      toasts: []
    });

    // Mock browser WebRTC globals for Node test environment
    (global as any).RTCPeerConnection = class MockRTCPeerConnection {
      public connectionState = 'connected';
      public createOffer = vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' });
      public createAnswer = vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' });
      public setLocalDescription = vi.fn().mockResolvedValue(undefined);
      public setRemoteDescription = vi.fn().mockResolvedValue(undefined);
      public addIceCandidate = vi.fn().mockResolvedValue(undefined);
      public createDataChannel = vi.fn().mockReturnValue({
        readyState: 'open',
        send: vi.fn(),
        close: vi.fn()
      });
      public close = vi.fn();
    };
    (global as any).RTCSessionDescription = class MockRTCSessionDescription {
      constructor(public init: any) {}
    };
    (global as any).RTCIceCandidate = class MockRTCIceCandidate {
      constructor(public init: any) {}
    };

    ConnectionManager.getInstance().resetForTesting();
  });

  it('Feature 1: Peer Discovery & Metadata Exchange', async () => {
    const manager = ConnectionManager.getInstance();

    // Simulate Bob broadcasting discovery beacon
    const bobBeacon = {
      id: 'peer_bob_remote',
      name: 'Bob (Workstation)',
      avatar: '🦅',
      ip: '192.168.1.150',
      port: 8485,
      os: 'mac' as any,
      version: '2.0.0',
      capabilities: ['file-stream', 'audio-video', 'remote-control', 'terminal'],
      lastSeen: Date.now()
    };

    usePeerStore.getState().upsertPeer(bobBeacon);

    const peer = usePeerStore.getState().peers['peer_bob_remote'];
    expect(peer).toBeDefined();
    expect(peer.name).toBe('Bob (Workstation)');
    expect(peer.avatar).toBe('🦅');
    expect(peer.ip).toBe('192.168.1.150');
  });

  it('Feature 2: Dual-Transport WebRTC Signaling (Offer / Answer / ICE)', async () => {
    const manager = ConnectionManager.getInstance();

    // Bob sends SDP offer to Alice
    const mockOffer: RTCSessionDescriptionInit = {
      type: 'offer',
      sdp: 'v=0\r\no=bob 12345 12345 IN IP4 127.0.0.1\r\ns=ZeroHop Test\r\n'
    };

    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'offer',
      offer: mockOffer,
      sourceName: 'Bob (Workstation)',
      sourceAvatar: '🦅'
    });

    const peer = usePeerStore.getState().peers['peer_bob_remote'];
    expect(peer).toBeDefined();
    expect(peer.name).toBe('Bob (Workstation)');

    // Bob sends ICE candidate
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'ice-candidate',
      candidate: { candidate: 'candidate:1 1 UDP 2130706431 192.168.1.150 54321 typ host', sdpMid: '0' }
    });
  });

  it('Feature 3: 1:1 Encrypted Audio/Video Calling & Ringing Notifications', async () => {
    const manager = ConnectionManager.getInstance();

    // Step A: Bob calls Alice (call-start)
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'call-start',
      callType: 'video',
      sourceName: 'Bob (Workstation)',
      sourceAvatar: '🦅'
    });

    // Verify Alice gets incoming call modal popup
    let notif = useNotificationStore.getState();
    expect(notif.incomingCall).toBeDefined();
    expect(notif.incomingCall?.peerName).toBe('Bob (Workstation)');
    expect(notif.incomingCall?.mode).toBe('video');

    // Step B: Alice accepts call -> Bob receives call-accepted
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'call-accepted',
      mode: 'video',
      sourceName: 'Bob (Workstation)'
    });

    expect(useCallStore.getState().isActive).toBe(true);
    expect(useCallStore.getState().peerName).toBe('Bob (Workstation)');

    // Step C: Call terminated
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'call-end'
    });

    expect(useCallStore.getState().isActive).toBe(false);
    expect(useNotificationStore.getState().incomingCall).toBeNull();
  });

  it('Feature 4: Live Encrypted Text Chat & Real-Time Toasts', async () => {
    const manager = ConnectionManager.getInstance();

    // Bob sends chat message
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'chat',
      text: 'Hey Alice! Let us review the ZeroHop architecture.',
      sourceName: 'Bob (Workstation)'
    });

    const messages = usePeerStore.getState().messages['peer_bob_remote'];
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Hey Alice! Let us review the ZeroHop architecture.');
    expect(messages[0].senderName).toBe('Bob (Workstation)');

    // Verify toast notification popped up
    const toasts = useNotificationStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('chat');
    expect(toasts[0].message).toContain('ZeroHop architecture');
  });

  it('Feature 5: Hyper-Stream File Transfer & Binary Packet Reassembly', async () => {
    const manager = ConnectionManager.getInstance();

    // Step A: Bob announces incoming 100MB video file
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'file-send',
      transferId: 'file_rec_99',
      fileName: 'project_demo.mp4',
      fileSize: 104857600,
      files: [{ name: 'project_demo.mp4', size: 104857600 }],
      sourceName: 'Bob (Workstation)',
      sourceAvatar: '🦅'
    });

    expect(useNotificationStore.getState().incomingTransfer).toBeDefined();
    expect(useFileStore.getState().transfers['file_rec_99']).toBeDefined();
    expect(useFileStore.getState().transfers['file_rec_99'].name).toBe('project_demo.mp4');

    // Step B: Stream binary chunk packet over 'files' channel
    const rawChunk = new TextEncoder().encode('ZeroHop High-Speed Binary Stream Payload');
    const metadata = {
      fileId: 'file_rec_99',
      chunkIndex: 0,
      totalChunks: 1,
      chunkHash: calculateChunkHash(rawChunk),
      byteOffset: 0
    };

    const metaBytes = new TextEncoder().encode(JSON.stringify(metadata));
    const packet = new Uint8Array(4 + metaBytes.length + rawChunk.length);
    new DataView(packet.buffer).setUint32(0, metaBytes.length, false);
    packet.set(metaBytes, 4);
    packet.set(rawChunk, 4 + metaBytes.length);

    // Route packet into ConnectionManager
    (manager as any).routeIncomingMessage('peer_bob_remote', 'files', packet.buffer);

    const transfer = useFileStore.getState().transfers['file_rec_99'];
    expect(transfer.progress).toBe(100);
    expect(transfer.status).toBe('completed');

    // Verify success toast
    const toasts = useNotificationStore.getState().toasts;
    expect(toasts.some((t) => t.title.includes('Download Complete'))).toBe(true);
  });

  it('Feature 6: Hardware Remote Desktop Session & Input Events', async () => {
    const manager = ConnectionManager.getInstance();

    // Step A: Bob requests remote access to Alice
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'remote-request',
      sourceName: 'Bob (Workstation)',
      sourceAvatar: '🦅'
    });

    expect(useNotificationStore.getState().incomingRemoteRequest).toBeDefined();
    expect(useNotificationStore.getState().incomingRemoteRequest?.peerName).toBe('Bob (Workstation)');

    // Step B: Alice grants access -> Bob receives remote-accepted
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'remote-accepted',
      controlMode: 'full-control',
      sourceName: 'Bob (Workstation)'
    });

    expect(useRemoteStore.getState().isActive).toBe(true);
    expect(useRemoteStore.getState().controlMode).toBe('full-control');
  });

  it('Feature 7: P2P Interactive Terminal Pairing (PTY)', async () => {
    const manager = ConnectionManager.getInstance();

    // Step A: Bob invites Alice to PTY shell
    await manager.handleIncomingSignal('peer_bob_remote', 'Bob (Workstation)', {
      type: 'terminal-request',
      sourceName: 'Bob (Workstation)',
      sourceAvatar: '🦅'
    });

    expect(useNotificationStore.getState().incomingTerminalRequest).toBeDefined();

    // Step B: Terminal output piping
    (manager as any).routeIncomingMessage('peer_bob_remote', 'terminal', {
      type: 'pty-data',
      data: 'alice@zerohop:~$ ls -la\n'
    });

    expect(useTerminalStore.getState().history).toContain('alice@zerohop:~$ ls -la\n');
  });

  it('Feature 8: Screen Whiteboard & Live Laser Markup', async () => {
    const manager = ConnectionManager.getInstance();

    // Receive live drawing markup
    const annotation = {
      id: 'ann_1',
      type: 'pen' as const,
      points: [{ x: 100, y: 150 }, { x: 200, y: 250 }],
      color: '#6366f1',
      strokeWidth: 3,
      author: 'Bob (Workstation)'
    };

    (manager as any).routeIncomingMessage('peer_bob_remote', 'markup', {
      type: 'annotation',
      annotation
    });

    expect(useCallStore.getState().annotations).toHaveLength(1);
    expect(useCallStore.getState().annotations[0].author).toBe('Bob (Workstation)');

    // Receive live laser pointer
    (manager as any).routeIncomingMessage('peer_bob_remote', 'markup', {
      type: 'laser',
      position: { x: 350, y: 420, author: 'Bob (Workstation)' }
    });

    expect(useCallStore.getState().laserPosition).toEqual({ x: 350, y: 420, author: 'Bob (Workstation)' });
  });
});
