import { sha256 } from '@noble/hashes/sha256';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';

export function calculateChunkHash(chunk: Uint8Array): string {
  try {
    return bytesToHex(blake3(chunk));
  } catch {
    return bytesToHex(sha256(chunk));
  }
}

export function generateRandomId(prefix = 'id'): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `${prefix}_${bytesToHex(bytes)}`;
}

export function generateRoomCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}
