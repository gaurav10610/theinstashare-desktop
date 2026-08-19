import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager } from '../src/renderer/src/core/transport/ConnectionManager';
import { usePeerStore } from '../src/renderer/src/stores/usePeerStore';

describe('P2P ConnectionManager & Multicast Signaling Suite', () => {
  let mockSignalListeners: Array<(data: any) => void> = [];
  let mockPeerFoundListeners: Array<(peer: any) => void> = [];
  let sentSignals: Array<{ target: string; signal: any }> = [];

  beforeEach(() => {
    mockSignalListeners = [];
    mockPeerFoundListeners = [];
    sentSignals = [];
    ConnectionManager.getInstance().resetForTesting();

    // Setup global window.api mock
    (global as any).window = {
      api: {
        platform: 'mac',
        startDiscovery: vi.fn().mockResolvedValue(true),
        stopDiscovery: vi.fn().mockResolvedValue(true),
        sendSignal: vi.fn((targetPeerId: string, signal: any) => {
          sentSignals.push({ target: targetPeerId, signal });
          return Promise.resolve(true);
        }),
        onPeerFound: vi.fn((callback) => {
          mockPeerFoundListeners.push(callback);
          return () => {};
        }),
        onSignalReceived: vi.fn((callback) => {
          mockSignalListeners.push(callback);
          return () => {};
        }),
        simulateInput: vi.fn().mockResolvedValue(true),
        spawnTerminal: vi.fn().mockResolvedValue(true),
        writeTerminal: vi.fn().mockResolvedValue(true),
        killTerminal: vi.fn().mockResolvedValue(true),
        onTerminalData: vi.fn(() => () => {})
      }
    };
  });

  it('should initialize LAN discovery and register signaling listeners', async () => {
    const manager = ConnectionManager.getInstance();
    await manager.init();

    expect(window.api.startDiscovery).toHaveBeenCalled();
    expect(window.api.onPeerFound).toHaveBeenCalled();
    expect(window.api.onSignalReceived).toHaveBeenCalled();
  });

  it('should upsert discovered peers when onPeerFound triggers', async () => {
    const manager = ConnectionManager.getInstance();
    await manager.init();

    const samplePeer = {
      id: 'peer_bob_999',
      name: 'Bob (Workstation)',
      avatar: '🦅',
      ip: '192.168.1.150',
      port: 8484,
      os: 'mac',
      version: '2.0.0',
      capabilities: ['file-stream', 'audio-video'],
      lastSeen: Date.now()
    };

    mockPeerFoundListeners.forEach((cb) => cb(samplePeer));

    const state = usePeerStore.getState();
    expect(state.peers['peer_bob_999']).toBeDefined();
    expect(state.peers['peer_bob_999'].name).toBe('Bob (Workstation)');
  });

  it('should broadcast room join requests with 6-digit room PINs', () => {
    const manager = ConnectionManager.getInstance();
    manager.joinRoomByCode('ABC123');

    expect(window.api.sendSignal).toHaveBeenCalledWith('*', expect.objectContaining({
      type: 'room-join-request',
      roomCode: 'ABC123'
    }));
  });

  it('should handle incoming chat messages over signaling channel', async () => {
    const manager = ConnectionManager.getInstance();
    await manager.init();

    const remoteMessage = {
      sourcePeerId: 'peer_charlie',
      sourcePeerName: 'Charlie',
      signal: {
        type: 'chat',
        text: 'Hello from Charlie via ZeroHop!'
      }
    };

    // Simulate incoming signal
    mockSignalListeners.forEach((cb) => cb(remoteMessage));

    // Also test sendChatMessage
    manager.sendChatMessage('peer_charlie', 'Reply message');
  });
});
