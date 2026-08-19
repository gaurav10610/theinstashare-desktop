export interface DiscoveredPeer {
  id: string;
  name: string;
  avatar: string;
  ip: string;
  port: number;
  os: string;
  version: string;
  capabilities: string[];
  lastSeen: number;
}

export interface RemoteInputEvent {
  type: 'mouse-move' | 'mouse-down' | 'mouse-up' | 'mouse-click' | 'mouse-dblclick' | 'scroll' | 'key-down' | 'key-up' | 'key-tap' | 'paste-text';
  x?: number;
  y?: number;
  button?: 'left' | 'middle' | 'right';
  deltaX?: number;
  deltaY?: number;
  key?: string;
  modifiers?: string[];
  text?: string;
  normalized?: boolean;
}

export interface ScreenSource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon?: string;
  display_id?: string;
}

export interface ElectronAPI {
  saveSecret: (key: string, value: string) => Promise<boolean>;
  getSecret: (key: string) => Promise<string | null>;
  deleteSecret: (key: string) => Promise<boolean>;

  startDiscovery: (peerInfo: DiscoveredPeer) => Promise<boolean>;
  stopDiscovery: () => Promise<boolean>;
  getLocalIPs: () => Promise<string[]>;
  onPeerFound: (callback: (peer: DiscoveredPeer) => void) => () => void;

  startWebBridge: (hostName: string, port?: number) => Promise<{ url: string; qrCode: string }>;
  stopWebBridge: () => Promise<boolean>;
  shareFileOnBridge: (file: { id: string; filePath: string; name: string; size: number; mime?: string }) => Promise<boolean>;
  unshareFileOnBridge: (fileId: string) => Promise<boolean>;
  onBridgeFileReceived: (callback: (file: { path: string; name: string; size: number }) => void) => () => void;

  spawnTerminal: (cols?: number, rows?: number) => Promise<boolean>;
  writeTerminal: (data: string) => Promise<boolean>;
  resizeTerminal: (cols: number, rows: number) => Promise<boolean>;
  killTerminal: () => Promise<boolean>;
  onTerminalData: (callback: (data: string) => void) => () => void;
  onTerminalExit: (callback: (code: number) => void) => () => void;

  simulateInput: (event: RemoteInputEvent) => Promise<boolean>;
  readClipboard: () => Promise<string>;
  writeClipboard: (text: string) => Promise<boolean>;

  getScreenSources: (types?: ('window' | 'screen')[]) => Promise<ScreenSource[]>;

  selectDirectory: () => Promise<string | null>;
  watchFolder: (dirPath: string) => Promise<boolean>;
  unwatchFolder: () => Promise<boolean>;
  readFolderFile: (relativePath: string) => Promise<Buffer | null>;
  writeFolderFile: (relativePath: string, data: Uint8Array) => Promise<boolean>;
  onFolderChange: (callback: (change: { type: 'add' | 'change' | 'unlink'; relativePath: string; size?: number; mtime?: number }) => void) => () => void;

  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isWindowMaximized: () => Promise<boolean>;

  openFileDialog: () => Promise<string[]>;
  openDirectoryDialog: () => Promise<string | null>;

  getAppArgs: () => Promise<{ peerName: string | null; peerAvatar: string | null }>;
  getVersionInfo: () => Promise<{ version: string; channel: string; platform: string; arch: string; electronVersion: string; chromeVersion: string; nodeVersion: string }>;
  checkUpdates: () => Promise<{ hasUpdate: boolean; currentVersion: string; latestVersion: string; releaseName: string; releaseNotes: string; publishedAt: string; downloadUrl: string; assetName?: string; assetSize?: number }>;
  openDownloadPage: (url: string) => Promise<boolean>;
  platform: string;
}
