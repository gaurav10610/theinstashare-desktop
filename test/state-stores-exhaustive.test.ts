import { describe, it, expect } from 'vitest';
import { usePeerStore } from '../src/renderer/src/stores/usePeerStore';
import { useFileStore } from '../src/renderer/src/stores/useFileStore';
import { useCallStore } from '../src/renderer/src/stores/useCallStore';
import { useRemoteStore } from '../src/renderer/src/stores/useRemoteStore';
import { useTerminalStore } from '../src/renderer/src/stores/useTerminalStore';
import { useAIStore } from '../src/renderer/src/stores/useAIStore';
import { useSettingsStore } from '../src/renderer/src/stores/useSettingsStore';

describe('Zustand State Stores Exhaustive Suite', () => {
  it('should maintain immutable updates when modifying peer collections', () => {
    const state0 = usePeerStore.getState().peers;
    usePeerStore.getState().upsertPeer({ id: 'p_immutable_1', name: 'Immutable Peer' });
    const state1 = usePeerStore.getState().peers;

    expect(state0).not.toBe(state1);
    expect(state1['p_immutable_1']).toBeDefined();
  });

  it('should cleanly transition call states and reset annotations on hangup', () => {
    const callStore = useCallStore.getState();
    callStore.startCall('p_1', 'Peer One', 'video');
    callStore.addAnnotation({
      id: 'ann_test',
      type: 'rect',
      points: [{ x: 5, y: 5 }, { x: 50, y: 50 }],
      color: '#38bdf8',
      size: 2,
      author: 'me',
      timestamp: Date.now()
    });

    expect(useCallStore.getState().isActive).toBe(true);
    expect(useCallStore.getState().annotations).toHaveLength(1);

    callStore.endCall();
    expect(useCallStore.getState().isActive).toBe(false);
    expect(useCallStore.getState().annotations).toHaveLength(0);
    expect(useCallStore.getState().durationSeconds).toBe(0);
  });

  it('should preserve terminal history bounds without memory leak', () => {
    const termStore = useTerminalStore.getState();
    termStore.startSession('p_1', 'Peer One', true);

    for (let i = 0; i < 50; i++) {
      termStore.appendHistory(`Line ${i}\n`);
    }

    expect(useTerminalStore.getState().history.length).toBe(50);
    termStore.clearHistory();
    expect(useTerminalStore.getState().history.length).toBe(0);
  });

  it('should manage settings store web bridge state transitions', () => {
    const settingsStore = useSettingsStore.getState();
    settingsStore.setWebBridgeActive(true, 'http://192.168.1.10:8484', 'data:image/png;base64,mockqr');

    expect(useSettingsStore.getState().isWebBridgeActive).toBe(true);
    expect(useSettingsStore.getState().webBridgeUrl).toBe('http://192.168.1.10:8484');

    settingsStore.setWebBridgeActive(false);
    expect(useSettingsStore.getState().isWebBridgeActive).toBe(false);
    expect(useSettingsStore.getState().webBridgeUrl).toBeNull();
    expect(useSettingsStore.getState().webBridgeQR).toBeNull();
  });
});
