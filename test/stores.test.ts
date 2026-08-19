import { describe, it, expect, beforeEach } from 'vitest';
import { usePeerStore } from '../src/renderer/src/stores/usePeerStore';
import { useFileStore } from '../src/renderer/src/stores/useFileStore';
import { useCallStore } from '../src/renderer/src/stores/useCallStore';
import { useRemoteStore } from '../src/renderer/src/stores/useRemoteStore';
import { useTerminalStore } from '../src/renderer/src/stores/useTerminalStore';
import { useAIStore } from '../src/renderer/src/stores/useAIStore';
import { useSettingsStore } from '../src/renderer/src/stores/useSettingsStore';

describe('Pure Functional State Store Tests', () => {
  describe('usePeerStore', () => {
    it('should initialize and manage peers and messages', () => {
      const { myId, myName, upsertPeer, removePeer, addMessage, messages } = usePeerStore.getState();
      expect(myId).toBeDefined();
      expect(myName).toBeDefined();

      upsertPeer({
        id: 'peer_1',
        name: 'Alice',
        avatar: '🦊',
        ip: '192.168.1.50',
        os: 'mac',
        isLocal: true
      });

      const peer = usePeerStore.getState().peers['peer_1'];
      expect(peer).toBeDefined();
      expect(peer.name).toBe('Alice');
      expect(peer.isLocal).toBe(true);

      addMessage('peer_1', {
        id: 'msg_1',
        senderId: 'me',
        senderName: 'Me',
        text: 'Hello Peer',
        timestamp: Date.now(),
        status: 'delivered'
      });

      const peerMsgs = usePeerStore.getState().messages['peer_1'];
      expect(peerMsgs.length).toBe(1);
      expect(peerMsgs[0].text).toBe('Hello Peer');

      removePeer('peer_1');
      expect(usePeerStore.getState().peers['peer_1']).toBeUndefined();
    });
  });

  describe('useFileStore', () => {
    it('should manage file transfers, drop shelf, and live folder sync events', () => {
      const { addTransfer, updateTransfer, addFolderSyncEvent } = useFileStore.getState();

      addTransfer({
        id: 'transfer_1',
        name: 'video.mp4',
        size: 104857600,
        type: 'video/mp4',
        progress: 0,
        speed: 0,
        direction: 'upload',
        status: 'queued',
        peerId: 'peer_1',
        peerName: 'Alice'
      });

      expect(useFileStore.getState().transfers['transfer_1'].status).toBe('queued');

      updateTransfer('transfer_1', { progress: 50, status: 'transferring', speed: 50000000 });
      expect(useFileStore.getState().transfers['transfer_1'].progress).toBe(50);
      expect(useFileStore.getState().transfers['transfer_1'].status).toBe('transferring');

      addFolderSyncEvent({ type: 'add', relativePath: 'src/index.ts' });
      expect(useFileStore.getState().folderSyncEvents.length).toBe(1);
      expect(useFileStore.getState().folderSyncEvents[0].relativePath).toBe('src/index.ts');
    });
  });

  describe('useCallStore', () => {
    it('should manage call states, audio/video toggles, and screen annotations', () => {
      const { startCall, toggleAudio, toggleVideo, addAnnotation, endCall } = useCallStore.getState();

      startCall('peer_1', 'Alice', 'video');
      expect(useCallStore.getState().isActive).toBe(true);
      expect(useCallStore.getState().peerName).toBe('Alice');

      toggleAudio();
      expect(useCallStore.getState().isAudioMuted).toBe(true);

      toggleVideo();
      expect(useCallStore.getState().isVideoMuted).toBe(true);

      addAnnotation({
        id: 'ann_1',
        type: 'pen',
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
        color: '#ef4444',
        size: 3,
        author: 'me',
        timestamp: Date.now()
      });
      expect(useCallStore.getState().annotations.length).toBe(1);

      endCall();
      expect(useCallStore.getState().isActive).toBe(false);
      expect(useCallStore.getState().annotations.length).toBe(0);
    });
  });

  describe('useRemoteStore', () => {
    it('should manage remote desktop control sessions and privacy mask', () => {
      const { startRemoteSession, togglePrivacyMask, setControlMode, endRemoteSession } = useRemoteStore.getState();

      startRemoteSession('peer_1', 'Alice', 'full-control');
      expect(useRemoteStore.getState().isActive).toBe(true);
      expect(useRemoteStore.getState().controlMode).toBe('full-control');

      togglePrivacyMask();
      expect(useRemoteStore.getState().isPrivacyMaskEnabled).toBe(true);

      setControlMode('view-only');
      expect(useRemoteStore.getState().controlMode).toBe('view-only');

      endRemoteSession();
      expect(useRemoteStore.getState().isActive).toBe(false);
    });
  });

  describe('useTerminalStore', () => {
    it('should manage interactive terminal sessions and history logging', () => {
      const { startSession, appendHistory, clearHistory, endSession } = useTerminalStore.getState();

      startSession('peer_1', 'Alice', true);
      expect(useTerminalStore.getState().isActive).toBe(true);
      expect(useTerminalStore.getState().isHost).toBe(true);

      appendHistory('$ echo "Hello P2P"');
      expect(useTerminalStore.getState().history.length).toBe(1);

      clearHistory();
      expect(useTerminalStore.getState().history.length).toBe(0);

      endSession();
      expect(useTerminalStore.getState().isActive).toBe(false);
    });
  });

  describe('useAIStore', () => {
    it('should manage BYOK settings, live speech transcripts, and meeting minutes', () => {
      const { updateSettings, addTranscriptSegment, addMeetingNote } = useAIStore.getState();

      updateSettings({ provider: 'gemini', apiKey: 'test_key_123' });
      expect(useAIStore.getState().settings.provider).toBe('gemini');
      expect(useAIStore.getState().settings.apiKey).toBe('test_key_123');

      addTranscriptSegment({
        time: '12:00',
        speaker: 'Gaurav',
        text: 'Reviewing project requirements'
      });
      expect(useAIStore.getState().liveTranscript.length).toBe(1);

      addMeetingNote({
        id: 'note_1',
        title: 'Sprint Planning',
        date: '2026-08-19',
        duration: '30 mins',
        participants: ['Gaurav'],
        summary: 'Reviewed P2P architecture.',
        transcript: [],
        actionItems: ['Run build'],
        decisions: ['Approved React 19']
      });
      expect(useAIStore.getState().meetingNotes.length).toBe(1);
    });
  });
});
