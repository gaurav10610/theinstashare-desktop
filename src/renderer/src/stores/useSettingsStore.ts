import { create } from 'zustand';

interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  webBridgePort: number;
  isWebBridgeActive: boolean;
  webBridgeUrl: string | null;
  webBridgeQR: string | null;
  defaultDownloadDir: string;
  autoAcceptFromKnownPeers: boolean;

  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setWebBridgeActive: (active: boolean, url?: string, qr?: string) => void;
  setDefaultDownloadDir: (dir: string) => void;
  setAutoAcceptFromKnownPeers: (accept: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  webBridgePort: 8484,
  isWebBridgeActive: false,
  webBridgeUrl: null,
  webBridgeQR: null,
  defaultDownloadDir: 'Downloads/ZeroHop',
  autoAcceptFromKnownPeers: false,

  setTheme: (theme) => set({ theme }),
  setWebBridgeActive: (isWebBridgeActive, url, qr) =>
    set({
      isWebBridgeActive,
      webBridgeUrl: url || null,
      webBridgeQR: qr || null
    }),
  setDefaultDownloadDir: (defaultDownloadDir) => set({ defaultDownloadDir }),
  setAutoAcceptFromKnownPeers: (autoAcceptFromKnownPeers) => set({ autoAcceptFromKnownPeers })
}));
