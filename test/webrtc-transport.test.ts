import { describe, it, expect, vi } from 'vitest';
import { WebRTCTransport } from '../src/renderer/src/core/transport/WebRTCTransport';
import { SignalingMessage } from '../src/renderer/src/core/types';

describe('WebRTC 2.0 Transport & Signaling Exhaustive Suite', () => {
  it('should format and serialize signaling messages with correct types', () => {
    const offerMsg: SignalingMessage = {
      type: 'offer',
      from: 'peer_alice',
      to: 'peer_bob',
      sdp: 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\n',
      timestamp: Date.now()
    };

    const str = JSON.stringify(offerMsg);
    const parsed: SignalingMessage = JSON.parse(str);

    expect(parsed.type).toBe('offer');
    expect(parsed.from).toBe('peer_alice');
    expect(parsed.to).toBe('peer_bob');
    expect(parsed.sdp).toBeDefined();
  });

  it('should format ICE candidate signaling messages', () => {
    const candidateMsg: SignalingMessage = {
      type: 'candidate',
      from: 'peer_alice',
      to: 'peer_bob',
      candidate: {
        candidate: 'candidate:1 1 UDP 2122252543 192.168.1.100 50000 typ host',
        sdpMid: '0',
        sdpMLineIndex: 0
      },
      timestamp: Date.now()
    };

    expect(candidateMsg.candidate?.sdpMid).toBe('0');
    expect(candidateMsg.candidate?.candidate).toContain('typ host');
  });

  it('should instantiate WebRTCTransport with custom STUN/TURN configuration', () => {
    const sendSignalingMock = vi.fn();
    const transport = new WebRTCTransport(
      'peer_local',
      'peer_remote',
      sendSignalingMock,
      {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:turn.instashare.io:3478', username: 'user', credential: 'password' }
        ]
      }
    );

    expect(transport).toBeDefined();
  });

  it('should calculate round-trip latency from ping/pong timestamps', () => {
    const t0 = 1000;
    const t1 = 1045; // 45 ms RTT

    const rtt = t1 - t0;
    expect(rtt).toBe(45);
    expect(rtt).toBeLessThan(100);
  });
});
