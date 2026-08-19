import { ipcMain, BrowserWindow } from 'electron';
import * as dgram from 'dgram';
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
  return ips;
}

export function registerDiscoveryIPC(): void {
  ipcMain.handle('discovery:start', async (event, peerInfo: DiscoveredPeer): Promise<boolean> => {
    try {
      if (socket) {
        socket.close();
        if (broadcastInterval) clearInterval(broadcastInterval);
      }

      localPeerInfo = peerInfo;
      socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      socket.on('error', (err) => {
        console.error('[Discovery IPC] Socket error:', err);
      });

      socket.on('message', (msg, rinfo) => {
        try {
          const data = JSON.parse(msg.toString('utf-8'));
          if (data.type === 'ZEROHOP_ANNOUNCE' && data.peer) {
            // Ignore self announcements
            if (data.peer.id === localPeerInfo?.id) return;

            const peer: DiscoveredPeer = {
              ...data.peer,
              ip: rinfo.address,
              lastSeen: Date.now()
            };

            const win = BrowserWindow.fromWebContents(event.sender);
            win?.webContents.send('discovery:peer-found', peer);
          }
        } catch {
          // Ignore invalid UDP payloads
        }
      });

      socket.bind(MULTICAST_PORT, () => {
        try {
          socket?.addMembership(MULTICAST_ADDR);
          socket?.setBroadcast(true);
          socket?.setMulticastTTL(128);
          console.log(`[Discovery IPC] Listening on multicast ${MULTICAST_ADDR}:${MULTICAST_PORT}`);
        } catch (err) {
          console.warn('[Discovery IPC] Multicast membership error:', err);
        }
      });

      // Broadcast presence every 3 seconds
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
      }, 3000);

      return true;
    } catch (err) {
      console.error('[Discovery IPC] Failed to start discovery:', err);
      return false;
    }
  });

  ipcMain.handle('discovery:stop', async (): Promise<boolean> => {
    try {
      if (broadcastInterval) clearInterval(broadcastInterval);
      if (socket) {
        socket.close();
        socket = null;
      }
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
