import { create } from 'zustand';

interface RemoteState {
  isActive: boolean;
  peerId: string | null;
  peerName: string | null;
  controlMode: 'view-only' | 'full-control';
  remoteResolution: { width: number; height: number };
  isPrivacyMaskEnabled: boolean;
  isClipboardSyncEnabled: boolean;

  startRemoteSession: (peerId: string, peerName: string, mode?: 'view-only' | 'full-control') => void;
  endRemoteSession: () => void;
  setControlMode: (mode: 'view-only' | 'full-control') => void;
  setRemoteResolution: (res: { width: number; height: number }) => void;
  togglePrivacyMask: () => void;
  toggleClipboardSync: () => void;
}

export const useRemoteStore = create<RemoteState>((set) => ({
  isActive: false,
  peerId: null,
  peerName: null,
  controlMode: 'full-control',
  remoteResolution: { width: 1920, height: 1080 },
  isPrivacyMaskEnabled: false,
  isClipboardSyncEnabled: true,

  startRemoteSession: (peerId, peerName, mode = 'full-control') =>
    set({ isActive: true, peerId, peerName, controlMode: mode }),
  endRemoteSession: () => set({ isActive: false, peerId: null, peerName: null }),
  setControlMode: (controlMode) => set({ controlMode }),
  setRemoteResolution: (remoteResolution) => set({ remoteResolution }),
  togglePrivacyMask: () => set((s) => ({ isPrivacyMaskEnabled: !s.isPrivacyMaskEnabled })),
  toggleClipboardSync: () => set((s) => ({ isClipboardSyncEnabled: !s.isClipboardSyncEnabled }))
}));
