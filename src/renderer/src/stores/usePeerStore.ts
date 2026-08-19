import { create } from 'zustand';
import { Peer, ChatMessage } from '../core/types';
import { generateRandomId } from '../core/crypto/hashing';

interface PeerState {
  myId: string;
  myName: string;
  myAvatar: string;
  selectedPeerId: string | null;
  peers: Record<string, Peer>;
  messages: Record<string, ChatMessage[]>; // keyed by peerId
  activeTab: 'dashboard' | 'talk' | 'files' | 'remote' | 'terminal' | 'ai' | 'settings';

  setMyName: (name: string) => void;
  setMyAvatar: (avatar: string) => void;
  setSelectedPeerId: (peerId: string | null) => void;
  setActiveTab: (tab: PeerState['activeTab']) => void;
  upsertPeer: (peer: Partial<Peer> & { id: string }) => void;
  removePeer: (id: string) => void;
  addMessage: (peerId: string, message: ChatMessage) => void;
  clearMessages: (peerId: string) => void;
  initFromAppArgs: () => Promise<void>;
}

const DEFAULT_AVATARS = ['🚀', '⚡', '🦊', '🦅', '🌌', '💎', '🔥', '🛡️'];

export const usePeerStore = create<PeerState>((set) => ({
  myId: generateRandomId('peer'),
  myName: `InstaUser-${Math.floor(1000 + Math.random() * 9000)}`,
  myAvatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
  selectedPeerId: null,
  peers: {},
  messages: {},
  activeTab: 'dashboard',

  setMyName: (name) => set({ myName: name }),
  setMyAvatar: (avatar) => set({ myAvatar: avatar }),
  setSelectedPeerId: (peerId) => set({ selectedPeerId: peerId }),
  setActiveTab: (activeTab) => set({ activeTab }),

  initFromAppArgs: async () => {
    try {
      const args = await window.api?.getAppArgs();
      if (args?.peerName) {
        set({ myName: args.peerName });
      }
      if (args?.peerAvatar) {
        set({ myAvatar: args.peerAvatar });
      }
    } catch {
      // ignore
    }
  },

  upsertPeer: (peer) =>
    set((state) => {
      const existing = state.peers[peer.id] || {
        id: peer.id,
        name: peer.name || 'Anonymous Peer',
        avatar: peer.avatar || '💻',
        ip: peer.ip || '127.0.0.1',
        os: peer.os || 'unknown',
        isLocal: peer.isLocal ?? true,
        connectionState: 'idle',
        lastSeen: Date.now()
      };
      return {
        peers: {
          ...state.peers,
          [peer.id]: { ...existing, ...peer, lastSeen: Date.now() }
        }
      };
    }),

  removePeer: (id) =>
    set((state) => {
      const newPeers = { ...state.peers };
      delete newPeers[id];
      return {
        peers: newPeers,
        selectedPeerId: state.selectedPeerId === id ? null : state.selectedPeerId
      };
    }),

  addMessage: (peerId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [peerId]: [...(state.messages[peerId] || []), message]
      }
    })),

  clearMessages: (peerId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [peerId]: []
      }
    }))
}));
