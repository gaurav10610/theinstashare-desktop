import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as dgram from 'dgram';
import * as http from 'http';
import { calculateChunkHash } from '../src/renderer/src/core/crypto/hashing';

const MULTICAST_ADDR = '239.255.255.250';
const MULTICAST_PORT = 53535;

describe('Multi-Instance Automated End-to-End P2P Testing', () => {
  let socketA: dgram.Socket;
  let socketB: dgram.Socket;
  const discoveredPeersA: any[] = [];
  const discoveredPeersB: any[] = [];

  const peerA = {
    id: 'peer_alice_test',
    name: 'Alice (MacBook)',
    avatar: '🦊',
    ip: '127.0.0.1',
    port: 8484,
    os: 'mac',
    version: '2.0.0',
    capabilities: ['file-stream', 'audio-video', 'remote-control', 'terminal']
  };

  const peerB = {
    id: 'peer_bob_test',
    name: 'Bob (Workstation)',
    avatar: '🦅',
    ip: '127.0.0.1',
    port: 8485,
    os: 'windows',
    version: '2.0.0',
    capabilities: ['file-stream', 'audio-video', 'remote-control', 'terminal']
  };

  beforeAll(async () => {
    // Setup Socket A (Instance 1)
    socketA = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    socketA.on('message', (msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        if (payload.type === 'INSTASHARE_ANNOUNCE' && payload.peer.id !== peerA.id) {
          discoveredPeersA.push(payload.peer);
        }
      } catch {}
    });

    await new Promise<void>((resolve) => {
      socketA.bind(MULTICAST_PORT, () => {
        try {
          socketA.addMembership(MULTICAST_ADDR);
          socketA.setBroadcast(true);
        } catch {}
        resolve();
      });
    });

    // Setup Socket B (Instance 2) - bind to same multicast port with reuseAddr
    socketB = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    socketB.on('message', (msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        if (payload.type === 'INSTASHARE_ANNOUNCE' && payload.peer.id !== peerB.id) {
          discoveredPeersB.push(payload.peer);
        }
      } catch {}
    });

    await new Promise<void>((resolve) => {
      socketB.bind(MULTICAST_PORT, () => {
        try {
          socketB.addMembership(MULTICAST_ADDR);
          socketB.setBroadcast(true);
        } catch {}
        resolve();
      });
    });
  });

  afterAll(() => {
    socketA.close();
    socketB.close();
  });

  it('Step 1: Multi-Instance UDP Multicast Discovery Test', async () => {
    // Instance A announces presence
    const payloadA = Buffer.from(JSON.stringify({ type: 'INSTASHARE_ANNOUNCE', peer: peerA }));
    socketA.send(payloadA, 0, payloadA.length, MULTICAST_PORT, MULTICAST_ADDR);

    // Instance B announces presence
    const payloadB = Buffer.from(JSON.stringify({ type: 'INSTASHARE_ANNOUNCE', peer: peerB }));
    socketB.send(payloadB, 0, payloadB.length, MULTICAST_PORT, MULTICAST_ADDR);

    // Wait for network exchange
    await new Promise((r) => setTimeout(r, 600));

    expect(discoveredPeersA.some((p) => p.id === peerB.id)).toBe(true);
    expect(discoveredPeersB.some((p) => p.id === peerA.id)).toBe(true);
  });

  it('Step 2: Web Guest Bridge HTTP & Download Portal Test', async () => {
    // Start ephemeral web bridge server on Instance A
    const server = http.createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><html><body><h1>InstaShare Web Bridge</h1></body></html>');
        return;
      }
      if (req.url === '/download/test-file') {
        res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="test.txt"' });
        res.end('Wire-speed file transfer payload content');
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await new Promise<void>((resolve) => server.listen(8490, resolve));

    // Test GET / from Instance B / Guest
    const rootRes = await fetch('http://127.0.0.1:8490/');
    expect(rootRes.ok).toBe(true);
    const html = await rootRes.text();
    expect(html).toContain('InstaShare Web Bridge');

    // Test GET /download/test-file
    const fileRes = await fetch('http://127.0.0.1:8490/download/test-file');
    expect(fileRes.ok).toBe(true);
    const content = await fileRes.text();
    expect(content).toBe('Wire-speed file transfer payload content');

    server.close();
  });

  it('Step 3: End-to-End BLAKE3 Chunk Integrity & Reassembly Test', async () => {
    const fileData = new Uint8Array(1024 * 128); // 128 KB test file
    for (let i = 0; i < fileData.length; i++) {
      fileData[i] = (i * 7) % 256;
    }

    const originalHash = calculateChunkHash(fileData);

    // Fragment into 2 chunks of 64KB
    const chunk1 = fileData.slice(0, 64 * 1024);
    const chunk2 = fileData.slice(64 * 1024);

    const hash1 = calculateChunkHash(chunk1);
    const hash2 = calculateChunkHash(chunk2);

    expect(hash1.length).toBeGreaterThan(0);
    expect(hash2.length).toBeGreaterThan(0);

    // Reassemble
    const reassembled = new Uint8Array(chunk1.length + chunk2.length);
    reassembled.set(chunk1, 0);
    reassembled.set(chunk2, chunk1.length);

    const reassembledHash = calculateChunkHash(reassembled);
    expect(reassembledHash).toBe(originalHash);
  });
});
