export interface TransportConfig {
  iceServers: RTCIceServer[];
}

const DEFAULT_STUN_CONFIG: TransportConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ]
};

export class WebRTCTransport {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();

  public onMessage?: (channel: string, data: any) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onTrack?: (track: MediaStreamTrack, stream: MediaStream) => void;
  public onIceCandidate?: (candidate: RTCIceCandidate) => void;
  public onDataChannel?: (channel: RTCDataChannel) => void;

  constructor(
    public readonly localPeerId: string,
    public readonly remotePeerId: string,
    public readonly sendSignaling?: (data: any) => void,
    private config: TransportConfig = DEFAULT_STUN_CONFIG
  ) {}

  public createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(this.config);

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.onConnectionStateChange?.(this.peerConnection.connectionState);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(event.candidate);
        this.sendSignaling?.({ type: 'ice-candidate', candidate: event.candidate.toJSON() });
      }
    };

    this.peerConnection.ontrack = (event) => {
      const stream = event.streams[0] || new MediaStream([event.track]);
      this.remoteStreams.set(event.track.kind, stream);
      this.onTrack?.(event.track, stream);
    };

    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
      this.onDataChannel?.(event.channel);
    };

    return this.peerConnection;
  }

  public createDataChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }
    const channel = this.peerConnection!.createDataChannel(label, options);
    this.setupDataChannel(channel);
    return channel;
  }

  public getDataChannel(label: string): RTCDataChannel | undefined {
    return this.dataChannels.get(label);
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    channel.binaryType = 'arraybuffer';
    this.dataChannels.set(channel.label, channel);

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          this.onMessage?.(channel.label, parsed);
        } catch {
          this.onMessage?.(channel.label, event.data);
        }
      } else {
        this.onMessage?.(channel.label, event.data);
      }
    };

    channel.onclose = () => {
      this.dataChannels.delete(channel.label);
    };
  }

  public send(channelLabel: string, data: any): boolean {
    const channel = this.dataChannels.get(channelLabel);
    if (!channel || channel.readyState !== 'open') {
      return false;
    }

    if (typeof data === 'string' || data instanceof ArrayBuffer || data instanceof Uint8Array) {
      channel.send(data as any);
    } else {
      channel.send(JSON.stringify(data));
    }
    return true;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) this.createPeerConnection();
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    return offer;
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) this.createPeerConnection();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('ICE candidate add error:', err);
      }
    }
  }

  public addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender | null {
    if (this.peerConnection) {
      return this.peerConnection.addTrack(track, stream);
    }
    return null;
  }

  public removeTrack(sender: RTCRtpSender): void {
    if (this.peerConnection) {
      this.peerConnection.removeTrack(sender);
    }
  }

  public close(): void {
    this.dataChannels.forEach((ch) => ch.close());
    this.dataChannels.clear();
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStreams.clear();
  }
}
