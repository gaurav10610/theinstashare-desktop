import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../src/renderer/src/stores/useNotificationStore';
import { ConnectionManager } from '../src/renderer/src/core/transport/ConnectionManager';
import { usePeerStore } from '../src/renderer/src/stores/usePeerStore';
import { useCallStore } from '../src/renderer/src/stores/useCallStore';
import { useFileStore } from '../src/renderer/src/stores/useFileStore';

describe('Dual-Transport Notifications & Interactive Modals Suite', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      incomingCall: null,
      incomingTransfer: null,
      incomingRemoteRequest: null,
      incomingTerminalRequest: null,
      toasts: []
    });
    ConnectionManager.getInstance().resetForTesting();
  });

  it('should trigger incoming call modal on call-start signal', async () => {
    const manager = ConnectionManager.getInstance();

    await manager.handleIncomingSignal('peer_alice_1', 'Alice (MacBook)', {
      type: 'call-start',
      callType: 'video',
      sourceName: 'Alice (MacBook)'
    });

    const notif = useNotificationStore.getState();
    expect(notif.incomingCall).toBeDefined();
    expect(notif.incomingCall?.peerId).toBe('peer_alice_1');
    expect(notif.incomingCall?.peerName).toBe('Alice (MacBook)');
    expect(notif.incomingCall?.mode).toBe('video');
  });

  it('should trigger incoming file transfer modal on file-send signal', async () => {
    const manager = ConnectionManager.getInstance();

    await manager.handleIncomingSignal('peer_bob_2', 'Bob (Workstation)', {
      type: 'file-send',
      transferId: 'tf_test_123',
      fileName: 'dataset.zip',
      fileSize: 104857600,
      files: [{ name: 'dataset.zip', size: 104857600 }],
      sourceName: 'Bob (Workstation)'
    });

    const notif = useNotificationStore.getState();
    expect(notif.incomingTransfer).toBeDefined();
    expect(notif.incomingTransfer?.peerId).toBe('peer_bob_2');
    expect(notif.incomingTransfer?.files[0].name).toBe('dataset.zip');

    const fileStore = useFileStore.getState();
    expect(fileStore.transfers['tf_test_123']).toBeDefined();
    expect(fileStore.transfers['tf_test_123'].direction).toBe('download');
  });

  it('should trigger remote desktop request modal on remote-request signal', async () => {
    const manager = ConnectionManager.getInstance();

    await manager.handleIncomingSignal('peer_carol_3', 'Carol (Linux)', {
      type: 'remote-request',
      sourceName: 'Carol (Linux)'
    });

    const notif = useNotificationStore.getState();
    expect(notif.incomingRemoteRequest).toBeDefined();
    expect(notif.incomingRemoteRequest?.peerId).toBe('peer_carol_3');
    expect(notif.incomingRemoteRequest?.peerName).toBe('Carol (Linux)');
  });

  it('should trigger terminal pairing request modal on terminal-request signal', async () => {
    const manager = ConnectionManager.getInstance();

    await manager.handleIncomingSignal('peer_dave_4', 'Dave (Server)', {
      type: 'terminal-request',
      sourceName: 'Dave (Server)'
    });

    const notif = useNotificationStore.getState();
    expect(notif.incomingTerminalRequest).toBeDefined();
    expect(notif.incomingTerminalRequest?.peerId).toBe('peer_dave_4');
    expect(notif.incomingTerminalRequest?.peerName).toBe('Dave (Server)');
  });

  it('should show toast notifications and add chat messages on chat signal', async () => {
    const manager = ConnectionManager.getInstance();

    await manager.handleIncomingSignal('peer_eve_5', 'Eve', {
      type: 'chat',
      text: 'Hey! Are you available for a quick sync?',
      sourceName: 'Eve'
    });

    const peerStore = usePeerStore.getState();
    expect(peerStore.messages['peer_eve_5']).toBeDefined();
    expect(peerStore.messages['peer_eve_5'][0].text).toContain('Hey! Are you available');

    const notif = useNotificationStore.getState();
    expect(notif.toasts.length).toBeGreaterThan(0);
    expect(notif.toasts[0].message).toContain('Hey! Are you available');
  });
});
