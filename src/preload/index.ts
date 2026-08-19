import { contextBridge, ipcRenderer } from 'electron';
import { DiscoveredPeer, RemoteInputEvent, ScreenSource, ElectronAPI } from './types';

export const api: ElectronAPI = {
  // Vault & API Keys
  saveSecret: (key: string, value: string): Promise<boolean> => ipcRenderer.invoke('vault:save-secret', key, value),
  getSecret: (key: string): Promise<string | null> => ipcRenderer.invoke('vault:get-secret', key),
  deleteSecret: (key: string): Promise<boolean> => ipcRenderer.invoke('vault:delete-secret', key),

  // LAN Discovery
  startDiscovery: (peerInfo: DiscoveredPeer): Promise<boolean> => ipcRenderer.invoke('discovery:start', peerInfo),
  stopDiscovery: (): Promise<boolean> => ipcRenderer.invoke('discovery:stop'),
  getLocalIPs: (): Promise<string[]> => ipcRenderer.invoke('discovery:get-local-ips'),
  onPeerFound: (callback: (peer: DiscoveredPeer) => void) => {
    const handler = (_: Electron.IpcRendererEvent, peer: DiscoveredPeer) => callback(peer);
    ipcRenderer.on('discovery:peer-found', handler);
    return () => ipcRenderer.removeListener('discovery:peer-found', handler);
  },

  // Web Bridge
  startWebBridge: (hostName: string, port?: number): Promise<{ url: string; qrCode: string }> => ipcRenderer.invoke('bridge:start', hostName, port),
  stopWebBridge: (): Promise<boolean> => ipcRenderer.invoke('bridge:stop'),
  shareFileOnBridge: (file: { id: string; filePath: string; name: string; size: number; mime?: string }): Promise<boolean> => ipcRenderer.invoke('bridge:share-file', file),
  unshareFileOnBridge: (fileId: string): Promise<boolean> => ipcRenderer.invoke('bridge:unshare-file', fileId),
  onBridgeFileReceived: (callback: (file: { path: string; name: string; size: number }) => void) => {
    const handler = (_: Electron.IpcRendererEvent, file: { path: string; name: string; size: number }) => callback(file);
    ipcRenderer.on('bridge:file-received', handler);
    return () => ipcRenderer.removeListener('bridge:file-received', handler);
  },

  // P2P Terminal
  spawnTerminal: (cols?: number, rows?: number): Promise<boolean> => ipcRenderer.invoke('terminal:spawn', cols, rows),
  writeTerminal: (data: string): Promise<boolean> => ipcRenderer.invoke('terminal:write', data),
  resizeTerminal: (cols: number, rows: number): Promise<boolean> => ipcRenderer.invoke('terminal:resize', cols, rows),
  killTerminal: (): Promise<boolean> => ipcRenderer.invoke('terminal:kill'),
  onTerminalData: (callback: (data: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: string) => callback(data);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },
  onTerminalExit: (callback: (code: number) => void) => {
    const handler = (_: Electron.IpcRendererEvent, code: number) => callback(code);
    ipcRenderer.on('terminal:exit', handler);
    return () => ipcRenderer.removeListener('terminal:exit', handler);
  },

  // Remote Input
  simulateInput: (event: RemoteInputEvent): Promise<boolean> => ipcRenderer.invoke('input:simulate', event),
  readClipboard: (): Promise<string> => ipcRenderer.invoke('input:read-clipboard'),
  writeClipboard: (text: string): Promise<boolean> => ipcRenderer.invoke('input:write-clipboard', text),

  // Screen Sources
  getScreenSources: (types?: ('window' | 'screen')[]): Promise<ScreenSource[]> => ipcRenderer.invoke('capturer:get-sources', types),

  // Live Folder Sync
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('folder-sync:select-directory'),
  watchFolder: (dirPath: string): Promise<boolean> => ipcRenderer.invoke('folder-sync:watch', dirPath),
  unwatchFolder: (): Promise<boolean> => ipcRenderer.invoke('folder-sync:unwatch'),
  readFolderFile: (relativePath: string): Promise<Buffer | null> => ipcRenderer.invoke('folder-sync:read-file', relativePath),
  writeFolderFile: (relativePath: string, data: Uint8Array): Promise<boolean> => ipcRenderer.invoke('folder-sync:write-file', relativePath, data),
  onFolderChange: (callback: (change: { type: 'add' | 'change' | 'unlink'; relativePath: string; size?: number; mtime?: number }) => void) => {
    const handler = (_: Electron.IpcRendererEvent, change: any) => callback(change);
    ipcRenderer.on('folder-sync:change', handler);
    return () => ipcRenderer.removeListener('folder-sync:change', handler);
  },

  // Window Controls
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized'),

  // Dialogs
  openFileDialog: (): Promise<string[]> => ipcRenderer.invoke('dialog:open-files'),
  openDirectoryDialog: (): Promise<string | null> => ipcRenderer.invoke('dialog:open-directory'),

  // App Args & Versioning
  getAppArgs: (): Promise<{ peerName: string | null; peerAvatar: string | null }> => ipcRenderer.invoke('app:get-cli-args'),
  getVersionInfo: () => ipcRenderer.invoke('release:get-version-info'),
  checkUpdates: () => ipcRenderer.invoke('release:check-updates'),
  openDownloadPage: (url: string) => ipcRenderer.invoke('release:open-download-page', url),

  // Platform
  platform: process.platform
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (fallback)
  window.api = api;
}
