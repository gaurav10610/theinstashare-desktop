import { ipcMain, BrowserWindow, dialog } from 'electron';
import * as chokidar from 'chokidar';
import * as fs from 'fs';
import * as path from 'path';

let activeWatcher: chokidar.FSWatcher | null = null;
let currentWatchedDir: string | null = null;

export function registerFolderSyncIPC(): void {
  ipcMain.handle('folder-sync:select-directory', async (event): Promise<string | null> => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('folder-sync:watch', async (event, dirPath: string): Promise<boolean> => {
    try {
      if (activeWatcher) {
        await activeWatcher.close();
      }

      currentWatchedDir = dirPath;
      const win = BrowserWindow.fromWebContents(event.sender);

      activeWatcher = chokidar.watch(dirPath, {
        ignored: /(^|[\/\\])\..|node_modules|\.git/, // ignore dotfiles and node_modules
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100
        }
      });

      activeWatcher.on('add', (filePath) => {
        const relativePath = path.relative(dirPath, filePath);
        const stats = fs.statSync(filePath);
        win?.webContents.send('folder-sync:change', {
          type: 'add',
          relativePath,
          size: stats.size,
          mtime: stats.mtimeMs
        });
      });

      activeWatcher.on('change', (filePath) => {
        const relativePath = path.relative(dirPath, filePath);
        const stats = fs.statSync(filePath);
        win?.webContents.send('folder-sync:change', {
          type: 'change',
          relativePath,
          size: stats.size,
          mtime: stats.mtimeMs
        });
      });

      activeWatcher.on('unlink', (filePath) => {
        const relativePath = path.relative(dirPath, filePath);
        win?.webContents.send('folder-sync:change', {
          type: 'unlink',
          relativePath
        });
      });

      return true;
    } catch (err) {
      console.error('[Folder Sync IPC] Watch error:', err);
      return false;
    }
  });

  ipcMain.handle('folder-sync:unwatch', async (): Promise<boolean> => {
    if (activeWatcher) {
      await activeWatcher.close();
      activeWatcher = null;
      currentWatchedDir = null;
    }
    return true;
  });

  ipcMain.handle('folder-sync:read-file', async (_, relativePath: string): Promise<Buffer | null> => {
    if (!currentWatchedDir) return null;
    const fullPath = path.join(currentWatchedDir, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath);
  });

  ipcMain.handle('folder-sync:write-file', async (_, relativePath: string, data: Buffer): Promise<boolean> => {
    if (!currentWatchedDir) return false;
    const fullPath = path.join(currentWatchedDir, relativePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.writeFileSync(fullPath, data);
    return true;
  });
}
