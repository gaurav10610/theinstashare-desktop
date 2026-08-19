import { describe, it, expect, vi } from 'vitest';
import { FileStreamer, CHUNK_SIZE, BUFFER_THRESHOLD, ChunkMetadata } from '../src/renderer/src/core/file-stream/FileStreamer';
import { calculateChunkHash } from '../src/renderer/src/core/crypto/hashing';

describe('Zero-RAM File Streamer Tests', () => {
  it('should verify chunk size and backpressure thresholds', () => {
    expect(CHUNK_SIZE).toBe(64 * 1024);
    expect(BUFFER_THRESHOLD).toBe(256 * 1024);
  });

  it('should accurately packetize and parse 4-byte header chunk metadata', () => {
    const rawData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const metadata: ChunkMetadata = {
      fileId: 'file_123',
      chunkIndex: 0,
      totalChunks: 1,
      chunkHash: calculateChunkHash(rawData),
      byteOffset: 0
    };

    const metaBytes = new TextEncoder().encode(JSON.stringify(metadata));
    const packet = new Uint8Array(4 + metaBytes.length + rawData.length);

    new DataView(packet.buffer).setUint32(0, metaBytes.length, false);
    packet.set(metaBytes, 4);
    packet.set(rawData, 4 + metaBytes.length);

    // Unpack
    const metaLen = new DataView(packet.buffer).getUint32(0, false);
    expect(metaLen).toBe(metaBytes.length);

    const parsedMetaStr = new TextDecoder().decode(packet.slice(4, 4 + metaLen));
    const parsedMeta: ChunkMetadata = JSON.parse(parsedMetaStr);
    expect(parsedMeta.fileId).toBe('file_123');
    expect(parsedMeta.chunkIndex).toBe(0);
    expect(parsedMeta.chunkHash).toBe(metadata.chunkHash);

    const extractedData = packet.slice(4 + metaLen);
    expect(Array.from(extractedData)).toEqual(Array.from(rawData));
  });

  it('should stream chunks across RTCDataChannel with progress callback', async () => {
    const content = 'Test file streaming payload with multiple bytes of data for testing';
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });

    const sentPackets: ArrayBuffer[] = [];
    const mockDataChannel = {
      bufferedAmount: 0,
      bufferedAmountLowThreshold: 0,
      send: vi.fn((data: ArrayBuffer) => {
        sentPackets.push(data);
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as RTCDataChannel;

    const progressUpdates: number[] = [];
    await FileStreamer.streamFile(
      file,
      'test_file_id',
      mockDataChannel,
      (prog) => {
        progressUpdates.push(prog);
      }
    );

    expect(sentPackets.length).toBeGreaterThan(0);
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
  });
});
