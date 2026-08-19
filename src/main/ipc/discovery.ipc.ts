import { ipcMain, BrowserWindow } from 'electron';
import * as dgram from 'dgram';
import * as http from 'http';
import * as os from 'os';

const MULTICAST_ADDR = '239.255.255.250';
const MULTICAST_PORT = 53535;

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

let socket: dgram.Socket | null = null;
let broadcastInterval: NodeJS.Timeout | null = null;
let localPeerInfo: DiscoveredPeer | null = null;
let activeRendererSender: any = null;
let signalingServer: http.Server | null = null;
let localHttpPort = 8484;

// Cache of discovered peers with their direct IP and HTTP port
const knownPeerEndpoints: Map<string, { ip: string; port: number }> = new Map();

function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  if (ips.length === 0) ips.push('127.0.0.1');
  return ips;
}

function startLocalHttpSignalingServer(): Promise<number> {
  return new Promise((resolve) => {
    const tryPort = (port: number) => {
      const server = http.createServer((req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        if (req.method === 'POST' && req.url === '/api/signal') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data && data.sourcePeerId && data.signal) {
                // Forward directly to renderer
                const win = BrowserWindow.fromWebContents(activeRendererSender);
                win?.webContents.send('discovery:signal-received', {
                  sourcePeerId: data.sourcePeerId,
                  sourcePeerName: data.sourcePeerName,
                  signal: data.signal
                });
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/eval') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', async () => {
            try {
              const { code } = JSON.parse(body);
              const win = (activeRendererSender ? BrowserWindow.fromWebContents(activeRendererSender) : null) || BrowserWindow.getAllWindows()[0];
              if (!win) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No active window' }));
                return;
              }
              const result = await win.webContents.executeJavaScript(code);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, result }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'GET' && req.url === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'online', peerId: localPeerInfo?.id, peerName: localPeerInfo?.name }));
          return;
        }

        res.writeHead(404);
        res.end();
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1);
        } else {
          console.error('[Signaling Server Error]:', err);
          resolve(port);
        }
      });

      server.listen(port, () => {
        localHttpPort = port;
        signalingServer = server;
        console.log(`[Discovery IPC] Direct HTTP signaling server listening on port: ${localHttpPort}`);
        resolve(localHttpPort);
      });
    };

    tryPort(8484);
  });
}

export function registerDiscoveryIPC(): void {
  ipcMain.handle('discovery:start', async (event, peerInfo: DiscoveredPeer): Promise<boolean> => {
    try {
      activeRendererSender = event.sender;
      if (socket) {
        socket.close();
        if (broadcastInterval) clearInterval(broadcastInterval);
      }
      if (signalingServer) {
        signalingServer.close();
        signalingServer = null;
      }

      // Start direct HTTP signaling server first
      const httpPort = await startLocalHttpSignalingServer();
      localPeerInfo = {
        ...peerInfo,
        port: httpPort
      };

      socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      socket.on('error', (err) => {
        console.error('[Discovery IPC] Socket error:', err);
      });

      socket.on('message', (msg, rinfo) => {
        try {
          const data = JSON.parse(msg.toString('utf-8'));

          // 1. Peer Discovery Beacons
          if (data.type === 'ZEROHOP_ANNOUNCE' && data.peer) {
            if (data.peer.id === localPeerInfo?.id) return;

            const peer: DiscoveredPeer = {
              ...data.peer,
              ip: rinfo.address,
              lastSeen: Date.now()
            };

            // Track peer's direct endpoint
            knownPeerEndpoints.set(peer.id, { ip: rinfo.address, port: peer.port || 8484 });

            const win = BrowserWindow.fromWebContents(activeRendererSender || event.sender);
            win?.webContents.send('discovery:peer-found', peer);
          }

          // 2. Direct P2P WebRTC Signaling over UDP Multicast
          if (data.type === 'ZEROHOP_SIGNAL') {
            if (data.sourcePeerId === localPeerInfo?.id) return;

            if (data.targetPeerId === localPeerInfo?.id || data.targetPeerId === '*') {
              const win = BrowserWindow.fromWebContents(activeRendererSender || event.sender);
              win?.webContents.send('discovery:signal-received', {
                sourcePeerId: data.sourcePeerId,
                sourcePeerName: data.sourcePeerName,
                signal: data.signal
              });
            }
          }
        } catch {
          // Ignore invalid UDP payloads
        }
      });

      socket.bind(MULTICAST_PORT, () => {
        try {
          socket?.addMembership(MULTICAST_ADDR);
          socket?.setBroadcast(true);
          socket?.setMulticastLoopback(true);
          socket?.setMulticastTTL(128);
          console.log(`[Discovery IPC] Listening on multicast ${MULTICAST_ADDR}:${MULTICAST_PORT} (Loopback Enabled)`);
        } catch (err) {
          console.warn('[Discovery IPC] Multicast membership error:', err);
        }
      });

      // Broadcast presence every 1.5 seconds
      broadcastInterval = setInterval(() => {
        if (!socket || !localPeerInfo) return;
        try {
          const payload = Buffer.from(
            JSON.stringify({
              type: 'ZEROHOP_ANNOUNCE',
              peer: localPeerInfo,
              timestamp: Date.now()
            })
          );
          socket.send(payload, 0, payload.length, MULTICAST_PORT, MULTICAST_ADDR);
        } catch (err) {
          console.error('[Discovery IPC] Broadcast error:', err);
        }
      }, 1500);

      return true;
    } catch (err) {
      console.error('[Discovery IPC] Failed to start discovery:', err);
      return false;
    }
  });

  ipcMain.handle('discovery:send-signal', async (_, targetPeerId: string, signal: any): Promise<boolean> => {
    if (!localPeerInfo) return false;
    let delivered = false;

    // 1. Send via UDP Multicast
    if (socket) {
      try {
        const payload = Buffer.from(
          JSON.stringify({
            type: 'ZEROHOP_SIGNAL',
            sourcePeerId: localPeerInfo.id,
            sourcePeerName: localPeerInfo.name,
            targetPeerId,
            signal,
            timestamp: Date.now()
          })
        );
        socket.send(payload, 0, payload.length, MULTICAST_PORT, MULTICAST_ADDR);
        delivered = true;
      } catch (err) {
        console.warn('[Discovery IPC] UDP Signal error:', err);
      }
    }

    // 2. Dual-transport: Also send directly via HTTP if target endpoint is known
    const targetEndpoint = knownPeerEndpoints.get(targetPeerId);
    if (targetEndpoint) {
      try {
        const postData = JSON.stringify({
          sourcePeerId: localPeerInfo.id,
          sourcePeerName: localPeerInfo.name,
          targetPeerId,
          signal,
          timestamp: Date.now()
        });

        const req = http.request(
          {
            hostname: targetEndpoint.ip === '127.0.0.1' || targetEndpoint.ip === 'localhost' ? '127.0.0.1' : targetEndpoint.ip,
            port: targetEndpoint.port,
            path: '/api/signal',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 2000
          },
          (res) => {
            res.resume();
          }
        );
        req.on('error', () => {});
        req.write(postData);
        req.end();
        delivered = true;
      } catch {
        // ignore direct http failure
      }
    }

    return delivered;
  });

  ipcMain.handle('discovery:stop', async (): Promise<boolean> => {
    try {
      if (broadcastInterval) clearInterval(broadcastInterval);
      if (socket) {
        socket.close();
        socket = null;
      }
      if (signalingServer) {
        signalingServer.close();
        signalingServer = null;
      }
      knownPeerEndpoints.clear();
      return true;
    } catch (err) {
      console.error('[Discovery IPC] Failed to stop discovery:', err);
      return false;
    }
  });

  ipcMain.handle('discovery:get-local-ips', async (): Promise<string[]> => {
    return getLocalIPs();
  });
}
