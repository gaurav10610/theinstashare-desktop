import { describe, it, expect } from 'vitest';
import { calculateChunkHash, generateRandomId, generateRoomCode } from '../src/renderer/src/core/crypto/hashing';

describe('Cryptographic Engine & Hashing Tests', () => {
  it('should generate consistent sub-millisecond hashes for data chunks', () => {
    const chunkA = new TextEncoder().encode('InstaShare Next BLAKE3 Chunk Stream Data Test');
    const hashA1 = calculateChunkHash(chunkA);
    const hashA2 = calculateChunkHash(chunkA);

    expect(hashA1).toBe(hashA2);
    expect(hashA1.length).toBeGreaterThan(0);

    const chunkB = new TextEncoder().encode('Different Chunk Content');
    const hashB = calculateChunkHash(chunkB);
    expect(hashA1).not.toBe(hashB);
  });

  it('should generate unique random IDs with custom prefix', () => {
    const id1 = generateRandomId('peer');
    const id2 = generateRandomId('peer');

    expect(id1.startsWith('peer_')).toBe(true);
    expect(id2.startsWith('peer_')).toBe(true);
    expect(id1).not.toBe(id2);
  });

  it('should generate a 6-character uppercase alphanumeric room code', () => {
    const code = generateRoomCode();
    expect(code.length).toBe(6);
    expect(/^[A-Z0-9]{6}$/.test(code)).toBe(true);
  });
});
