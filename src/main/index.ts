import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { registerStorageIPC } from './ipc/storage.ipc';
import { registerDiscoveryIPC } from './ipc/discovery.ipc';
import { registerWebBridgeIPC } from './ipc/web-bridge.ipc';
import { registerTerminalIPC } from './ipc/terminal.ipc';
import { registerInputIPC } from './ipc/input.ipc';
import { registerCapturerIPC } from './ipc/capturer.ipc';
import { registerFolderSyncIPC } from './ipc/folder-sync.ipc';
import { registerReleaseIPC } from './ipc/release.ipc';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Parse CLI flags for multi-instance testing
const peerNameArg = process.argv.find((arg) => arg.startsWith('--peer-name='))?.split('=')[1];
const peerAvatarArg = process.argv.find((arg) => arg.startsWith('--peer-avatar='))?.split('=')[1];
const windowTitle = peerNameArg ? `InstaShare Next - ${peerNameArg}` : 'InstaShare Next';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: windowTitle,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#090d16',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load renderer URL
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// Window control IPCs
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() || false);

// App Args IPC
ipcMain.handle('app:get-cli-args', () => ({
  peerName: peerNameArg || null,
  peerAvatar: peerAvatarArg || null
}));

// File dialog IPCs
ipcMain.handle('dialog:open-files', async () => {
  if (!mainWindow) return [];
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });
  return res.canceled ? [] : res.filePaths;
});

ipcMain.handle('dialog:open-directory', async () => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return res.canceled || res.filePaths.length === 0 ? null : res.filePaths[0];
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.theinstashare.desktop');

  // Register all typed IPC modules
  registerStorageIPC();
  registerDiscoveryIPC();
  registerWebBridgeIPC();
  registerTerminalIPC();
  registerInputIPC();
  registerCapturerIPC();
  registerFolderSyncIPC();
  registerReleaseIPC();

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
