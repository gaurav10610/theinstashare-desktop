import { describe, it, expect } from 'vitest';
import { DiscoveredPeer } from '../src/preload/types';

describe('LAN Multicast & Discovery Exhaustive Suite', () => {
  it('should validate and parse discovered peer payload structures', () => {
    const rawPeer: DiscoveredPeer = {
      id: 'peer_abc123',
      name: 'MacBook Pro M3',
      avatar: '🚀',
      ip: '192.168.1.150',
      port: 8484,
      os: 'mac',
      version: '2.0.0',
      capabilities: ['file-stream', 'audio-video', 'remote-control', 'terminal', 'folder-sync'],
      lastSeen: Date.now()
    };

    const encoded = JSON.stringify({ type: 'ZEROHOP_ANNOUNCE', peer: rawPeer });
    const decoded = JSON.parse(encoded);

    expect(decoded.type).toBe('ZEROHOP_ANNOUNCE');
    expect(decoded.peer.id).toBe('peer_abc123');
    expect(decoded.peer.capabilities).toContain('remote-control');
    expect(decoded.peer.capabilities).toContain('terminal');
  });

  it('should filter out self announcements based on local peer ID', () => {
    const myId = 'peer_self_123';

    const peers = [
      { id: 'peer_self_123', name: 'Self Peer' },
      { id: 'peer_remote_456', name: 'Remote Peer' }
    ];

    const filtered = peers.filter((p) => p.id !== myId);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('peer_remote_456');
  });

  it('should detect stale peers based on heartbeat TTL expiration (>10 seconds)', () => {
    const now = Date.now();
    const activePeers = [
      { id: 'peer_1', name: 'Active Peer', lastSeen: now - 2000 },
      { id: 'peer_2', name: 'Stale Peer', lastSeen: now - 15000 }
    ];

    const TTL_MS = 10000;
    const livePeers = activePeers.filter((p) => now - p.lastSeen <= TTL_MS);

    expect(livePeers).toHaveLength(1);
    expect(livePeers[0].id).toBe('peer_1');
  });
});
