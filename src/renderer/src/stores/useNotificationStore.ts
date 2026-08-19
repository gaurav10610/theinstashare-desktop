import { create } from 'zustand';

export interface IncomingCallData {
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  mode: 'audio' | 'video' | 'screen';
}

export interface IncomingTransferData {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  files: Array<{ name: string; size: number }>;
}

export interface IncomingRemoteData {
  peerId: string;
  peerName: string;
  peerAvatar?: string;
}

export interface IncomingTerminalData {
  peerId: string;
  peerName: string;
  peerAvatar?: string;
}

export interface ToastMessage {
  id: string;
  type: 'chat' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  peerId?: string;
  timestamp: number;
}

interface NotificationState {
  incomingCall: IncomingCallData | null;
  incomingTransfer: IncomingTransferData | null;
  incomingRemoteRequest: IncomingRemoteData | null;
  incomingTerminalRequest: IncomingTerminalData | null;
  toasts: ToastMessage[];

  setIncomingCall: (call: IncomingCallData | null) => void;
  setIncomingTransfer: (transfer: IncomingTransferData | null) => void;
  setIncomingRemoteRequest: (req: IncomingRemoteData | null) => void;
  setIncomingTerminalRequest: (req: IncomingTerminalData | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  incomingCall: null,
  incomingTransfer: null,
  incomingRemoteRequest: null,
  incomingTerminalRequest: null,
  toasts: [],

  setIncomingCall: (incomingCall) => set({ incomingCall }),
  setIncomingTransfer: (incomingTransfer) => set({ incomingTransfer }),
  setIncomingRemoteRequest: (incomingRemoteRequest) => set({ incomingRemoteRequest }),
  setIncomingTerminalRequest: (incomingTerminalRequest) => set({ incomingTerminalRequest }),

  addToast: (toast) =>
    set((state) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = {
        ...toast,
        id,
        timestamp: Date.now()
      };
      return {
        toasts: [...state.toasts.slice(-4), newToast]
      };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));
