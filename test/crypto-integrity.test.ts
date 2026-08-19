import { describe, it, expect } from 'vitest';
import { calculateChunkHash, generateRandomId, generateRoomCode } from '../src/renderer/src/core/crypto/hashing';

describe('Cryptographic Integrity & Hashing Exhaustive Suite', () => {
  it('should hash empty buffers consistently without error', () => {
    const emptyBuf = new Uint8Array(0);
    const hash1 = calculateChunkHash(emptyBuf);
    const hash2 = calculateChunkHash(emptyBuf);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('should hash single-byte and arbitrary length payloads deterministically', () => {
    const b1 = new Uint8Array([0x42]);
    const b2 = new Uint8Array([0x42]);
    const b3 = new Uint8Array([0x43]);

    expect(calculateChunkHash(b1)).toBe(calculateChunkHash(b2));
    expect(calculateChunkHash(b1)).not.toBe(calculateChunkHash(b3));
  });

  it('should detect single-bit corruption in 64KB chunks', () => {
    const original = new Uint8Array(64 * 1024);
    for (let i = 0; i < original.length; i++) {
      original[i] = (i * 13) % 256;
    }

    const corrupted = new Uint8Array(original);
    // Flip 1 bit at byte 32000
    corrupted[32000] ^= 0x01;

    const originalHash = calculateChunkHash(original);
    const corruptedHash = calculateChunkHash(corrupted);

    expect(originalHash).not.toBe(corruptedHash);
  });

  it('should produce 1,000 unique IDs with zero collisions', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const id = generateRandomId('test');
      expect(id.startsWith('test_')).toBe(true);
      set.add(id);
    }
    expect(set.size).toBe(1000);
  });

  it('should produce 500 valid 6-char uppercase alphanumeric room codes', () => {
    for (let i = 0; i < 500; i++) {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
      expect(/^[A-Z0-9]{6}$/.test(code)).toBe(true);
    }
  });
});
