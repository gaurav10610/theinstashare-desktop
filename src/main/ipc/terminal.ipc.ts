import { ipcMain, BrowserWindow } from 'electron';
import * as os from 'os';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

let ptyProcess: any = null;
let fallbackProcess: ChildProcessWithoutNullStreams | null = null;

export function registerTerminalIPC(): void {
  ipcMain.handle('terminal:spawn', async (event, cols = 80, rows = 24): Promise<boolean> => {
    try {
      const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/zsh');
      const win = BrowserWindow.fromWebContents(event.sender);

      // Attempt to load node-pty dynamically
      try {
        const pty = await import('node-pty');
        if (ptyProcess) ptyProcess.kill();

        ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-256color',
          cols,
          rows,
          cwd: os.homedir(),
          env: process.env as Record<string, string>
        });

        ptyProcess.onData((data: string) => {
          win?.webContents.send('terminal:data', data);
        });

        ptyProcess.onExit((exitCode: { exitCode: number; signal?: number }) => {
          win?.webContents.send('terminal:exit', exitCode.exitCode);
        });

        return true;
      } catch (nodePtyError) {
        console.warn('[Terminal IPC] node-pty not available, falling back to child_process spawn:', nodePtyError);

        if (fallbackProcess) fallbackProcess.kill();

        fallbackProcess = spawn(shell, [], {
          cwd: os.homedir(),
          env: process.env
        });

        fallbackProcess.stdout.on('data', (data) => {
          win?.webContents.send('terminal:data', data.toString('utf-8'));
        });

        fallbackProcess.stderr.on('data', (data) => {
          win?.webContents.send('terminal:data', data.toString('utf-8'));
        });

        fallbackProcess.on('close', (code) => {
          win?.webContents.send('terminal:exit', code || 0);
        });

        return true;
      }
    } catch (err) {
      console.error('[Terminal IPC] Failed to spawn shell:', err);
      return false;
    }
  });

  ipcMain.handle('terminal:write', async (_, data: string): Promise<boolean> => {
    if (ptyProcess) {
      ptyProcess.write(data);
      return true;
    } else if (fallbackProcess && fallbackProcess.stdin.writable) {
      fallbackProcess.stdin.write(data);
      return true;
    }
    return false;
  });

  ipcMain.handle('terminal:resize', async (_, cols: number, rows: number): Promise<boolean> => {
    if (ptyProcess && ptyProcess.resize) {
      ptyProcess.resize(cols, rows);
      return true;
    }
    return false;
  });

  ipcMain.handle('terminal:kill', async (): Promise<boolean> => {
    if (ptyProcess) {
      ptyProcess.kill();
      ptyProcess = null;
    }
    if (fallbackProcess) {
      fallbackProcess.kill();
      fallbackProcess = null;
    }
    return true;
  });
}
