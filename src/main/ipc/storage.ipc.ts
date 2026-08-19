import { ipcMain, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const getStoragePath = () => {
  const userData = app.getPath('userData');
  return path.join(userData, 'zerohop_vault.enc');
};

export function registerStorageIPC(): void {
  ipcMain.handle('vault:save-secret', async (_, key: string, value: string): Promise<boolean> => {
    try {
      const storageFile = getStoragePath();
      let vault: Record<string, string> = {};

      if (fs.existsSync(storageFile)) {
        try {
          const raw = fs.readFileSync(storageFile);
          if (safeStorage.isEncryptionAvailable()) {
            const decrypted = safeStorage.decryptString(raw);
            vault = JSON.parse(decrypted);
          } else {
            vault = JSON.parse(raw.toString('utf-8'));
          }
        } catch {
          vault = {};
        }
      }

      vault[key] = value;

      const payload = JSON.stringify(vault);
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(payload);
        fs.writeFileSync(storageFile, encrypted);
      } else {
        fs.writeFileSync(storageFile, Buffer.from(payload, 'utf-8'));
      }
      return true;
    } catch (err) {
      console.error('[Storage IPC] Failed to save secret:', err);
      return false;
    }
  });

  ipcMain.handle('vault:get-secret', async (_, key: string): Promise<string | null> => {
    try {
      const storageFile = getStoragePath();
      if (!fs.existsSync(storageFile)) return null;

      const raw = fs.readFileSync(storageFile);
      let vault: Record<string, string> = {};

      if (safeStorage.isEncryptionAvailable()) {
        const decrypted = safeStorage.decryptString(raw);
        vault = JSON.parse(decrypted);
      } else {
        vault = JSON.parse(raw.toString('utf-8'));
      }

      return vault[key] || null;
    } catch (err) {
      console.error('[Storage IPC] Failed to get secret:', err);
      return null;
    }
  });

  ipcMain.handle('vault:delete-secret', async (_, key: string): Promise<boolean> => {
    try {
      const storageFile = getStoragePath();
      if (!fs.existsSync(storageFile)) return true;

      const raw = fs.readFileSync(storageFile);
      let vault: Record<string, string> = {};

      if (safeStorage.isEncryptionAvailable()) {
        const decrypted = safeStorage.decryptString(raw);
        vault = JSON.parse(decrypted);
      } else {
        vault = JSON.parse(raw.toString('utf-8'));
      }

      delete vault[key];

      const payload = JSON.stringify(vault);
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(payload);
        fs.writeFileSync(storageFile, encrypted);
      } else {
        fs.writeFileSync(storageFile, Buffer.from(payload, 'utf-8'));
      }
      return true;
    } catch (err) {
      console.error('[Storage IPC] Failed to delete secret:', err);
      return false;
    }
  });
}
