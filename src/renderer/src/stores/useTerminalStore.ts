import { create } from 'zustand';

interface TerminalState {
  isActive: boolean;
  peerId: string | null;
  peerName: string | null;
  isHost: boolean;
  canRemoteType: boolean;
  history: string[];

  startSession: (peerId: string, peerName: string, isHost: boolean) => void;
  endSession: () => void;
  setCanRemoteType: (allowed: boolean) => void;
  appendHistory: (entry: string) => void;
  clearHistory: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isActive: false,
  peerId: null,
  peerName: null,
  isHost: false,
  canRemoteType: true,
  history: [],

  startSession: (peerId, peerName, isHost) =>
    set({ isActive: true, peerId, peerName, isHost }),
  endSession: () => set({ isActive: false, peerId: null, peerName: null }),
  setCanRemoteType: (canRemoteType) => set({ canRemoteType }),
  appendHistory: (entry) => set((s) => ({ history: [...s.history, entry] })),
  clearHistory: () => set({ history: [] })
}));
