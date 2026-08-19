import { ipcMain, BrowserWindow } from 'electron';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import QRCode from 'qrcode';

let server: http.Server | null = null;
let activePort = 8484;
const sharedFilesMap = new Map<string, { filePath: string; name: string; size: number; mime: string }>();

function getPrimaryLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function getWebGuestHTML(peerName: string, filesList: Array<{ id: string; name: string; size: string }>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>InstaShare Next | Web Bridge</title>
  <style>
    :root {
      --primary: #6366f1;
      --bg: #0f172a;
      --card: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #334155;
      --accent: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
    .container { max-width: 480px; width: 100%; }
    .header { text-align: center; margin-bottom: 24px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    p { color: var(--muted); font-size: 14px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    .card-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
    .file-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); }
    .file-info { overflow: hidden; margin-right: 12px; }
    .file-name { font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-size { font-size: 12px; color: var(--muted); }
    .btn { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .upload-zone:hover { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
    .empty { color: var(--muted); font-size: 13px; text-align: center; padding: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">⚡ Zero-Install Web Gateway</div>
      <h1>Connected to ${peerName}</h1>
      <p>Instant wire-speed transfer over local Wi-Fi</p>
    </div>

    <div class="card">
      <div class="card-title">
        <span>Available Files (${filesList.length})</span>
      </div>
      <div id="file-list">
        ${
          filesList.length === 0
            ? '<div class="empty">No files shared yet by host.</div>'
            : filesList
                .map(
                  (f) => `
          <div class="file-item">
            <div class="file-info">
              <div class="file-name">${f.name}</div>
              <div class="file-size">${f.size}</div>
            </div>
            <a href="/download/${f.id}" class="btn" download="${f.name}">Download</a>
          </div>`
                )
                .join('')
        }
      </div>
    </div>

    <div class="card">
      <div class="card-title">Send Files to Host</div>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <label class="upload-zone" style="display:block">
          <input type="file" name="files" multiple style="display:none" onchange="this.form.submit()">
          <div style="font-size:24px; margin-bottom:8px">📁</div>
          <div style="font-weight:600; margin-bottom:4px">Tap to select photos or files</div>
          <div style="font-size:12px; color:var(--muted)">Direct peer-to-peer transmission</div>
        </label>
      </form>
    </div>
  </div>
</body>
</html>`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function registerWebBridgeIPC(): void {
  ipcMain.handle('bridge:start', async (event, hostName: string, port = 8484): Promise<{ url: string; qrCode: string }> => {
    activePort = port;
    if (server) {
      server.close();
    }

    server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      if (url.pathname === '/') {
        const files = Array.from(sharedFilesMap.entries()).map(([id, item]) => ({
          id,
          name: item.name,
          size: formatBytes(item.size)
        }));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getWebGuestHTML(hostName, files));
        return;
      }

      if (url.pathname.startsWith('/download/')) {
        const fileId = url.pathname.replace('/download/', '');
        const fileItem = sharedFilesMap.get(fileId);
        if (fileItem && fs.existsSync(fileItem.filePath)) {
          const stat = fs.statSync(fileItem.filePath);
          res.writeHead(200, {
            'Content-Type': fileItem.mime || 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileItem.name)}"`
          });
          const stream = fs.createReadStream(fileItem.filePath);
          stream.pipe(res);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
        return;
      }

      if (url.pathname === '/upload' && req.method === 'POST') {
        const uploadsDir = path.join(os.homedir(), 'Downloads', 'InstaShare');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        // Pipe incoming body directly to temporary file
        const timestamp = Date.now();
        const tempPath = path.join(uploadsDir, `guest_upload_${timestamp}.bin`);
        const fileStream = fs.createWriteStream(tempPath);

        req.pipe(fileStream);
        fileStream.on('finish', () => {
          const win = BrowserWindow.fromWebContents(event.sender);
          win?.webContents.send('bridge:file-received', {
            path: tempPath,
            name: `guest_upload_${timestamp}`,
            size: fs.statSync(tempPath).size
          });

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<script>alert("File received successfully by host!"); window.location.href="/";</script>');
        });
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    server.listen(activePort);
    const ip = getPrimaryLocalIP();
    const serverUrl = `http://${ip}:${activePort}`;
    const qrCode = await QRCode.toDataURL(serverUrl, { margin: 2, width: 256 });

    return { url: serverUrl, qrCode };
  });

  ipcMain.handle('bridge:share-file', async (_, file: { id: string; filePath: string; name: string; size: number; mime?: string }) => {
    sharedFilesMap.set(file.id, {
      filePath: file.filePath,
      name: file.name,
      size: file.size,
      mime: file.mime || 'application/octet-stream'
    });
    return true;
  });

  ipcMain.handle('bridge:unshare-file', async (_, fileId: string) => {
    sharedFilesMap.delete(fileId);
    return true;
  });

  ipcMain.handle('bridge:stop', async () => {
    if (server) {
      server.close();
      server = null;
    }
    sharedFilesMap.clear();
    return true;
  });
}
