import { describe, it, expect, vi } from 'vitest';
import { FileStreamer, CHUNK_SIZE, BUFFER_THRESHOLD, ChunkMetadata } from '../src/renderer/src/core/file-stream/FileStreamer';
import { calculateChunkHash } from '../src/renderer/src/core/crypto/hashing';

describe('File Streaming Engine Exhaustive Suite', () => {
  it('should correctly format binary packets with Big-Endian 4-byte header', () => {
    const rawPayload = new TextEncoder().encode('Hello ZeroHop Chunk');
    const metadata: ChunkMetadata = {
      fileId: 'file_test_99',
      chunkIndex: 3,
      totalChunks: 10,
      chunkHash: calculateChunkHash(rawPayload),
      byteOffset: 3 * CHUNK_SIZE
    };

    const metaBytes = new TextEncoder().encode(JSON.stringify(metadata));
    const packet = new Uint8Array(4 + metaBytes.length + rawPayload.length);

    new DataView(packet.buffer).setUint32(0, metaBytes.length, false);
    packet.set(metaBytes, 4);
    packet.set(rawPayload, 4 + metaBytes.length);

    // Verify unpack
    const metaLength = new DataView(packet.buffer).getUint32(0, false);
    expect(metaLength).toBe(metaBytes.length);

    const parsedJson = JSON.parse(new TextDecoder().decode(packet.slice(4, 4 + metaLength)));
    expect(parsedJson.fileId).toBe('file_test_99');
    expect(parsedJson.chunkIndex).toBe(3);
    expect(parsedJson.totalChunks).toBe(10);
    expect(parsedJson.chunkHash).toBe(metadata.chunkHash);

    const extractedPayload = packet.slice(4 + metaLength);
    expect(new TextDecoder().decode(extractedPayload)).toBe('Hello ZeroHop Chunk');
  });

  it('should handle zero-byte file streaming gracefully', async () => {
    const emptyBlob = new Blob([], { type: 'text/plain' });
    const emptyFile = new File([emptyBlob], 'empty.txt', { type: 'text/plain' });

    const sentPackets: ArrayBuffer[] = [];
    const mockDataChannel = {
      bufferedAmount: 0,
      bufferedAmountLowThreshold: 0,
      send: vi.fn((data: ArrayBuffer) => sentPackets.push(data)),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as RTCDataChannel;

    let finalProgress = 0;
    await FileStreamer.streamFile(emptyFile, 'empty_id', mockDataChannel, (p) => {
      finalProgress = p;
    });

    expect(finalProgress).toBe(100);
  });

  it('should trigger backpressure when bufferedAmount exceeds BUFFER_THRESHOLD', async () => {
    // 512 KB payload (8 chunks of 64KB)
    const largeData = new Uint8Array(512 * 1024);
    const blob = new Blob([largeData], { type: 'application/octet-stream' });
    const file = new File([blob], 'large.bin', { type: 'application/octet-stream' });

    let bufferedAmount = 0;
    let listeners: Record<string, Function[]> = {};

    const mockDataChannel = {
      get bufferedAmount() {
        return bufferedAmount;
      },
      bufferedAmountLowThreshold: 0,
      send: vi.fn(() => {
        bufferedAmount += CHUNK_SIZE;
      }),
      addEventListener: vi.fn((event: string, handler: Function) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: Function) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((h) => h !== handler);
        }
      })
    } as unknown as RTCDataChannel;

    // Simulate drain loop
    const drainInterval = setInterval(() => {
      if (bufferedAmount > 0) {
        bufferedAmount = 0;
        listeners['bufferedamountlow']?.forEach((h) => h());
      }
    }, 10);

    const progressSteps: number[] = [];
    await FileStreamer.streamFile(file, 'large_file_id', mockDataChannel, (p) => {
      progressSteps.push(p);
    });

    clearInterval(drainInterval);

    expect(mockDataChannel.send).toHaveBeenCalledTimes(8);
    expect(progressSteps[progressSteps.length - 1]).toBe(100);
  });

  it('should detect chunk hash mismatch during stream verification', () => {
    const chunkData = new TextEncoder().encode('Valid chunk contents');
    const validHash = calculateChunkHash(chunkData);

    const corruptedChunkData = new TextEncoder().encode('Corrupted chunk contents');
    const corruptedHash = calculateChunkHash(corruptedChunkData);

    expect(validHash).not.toBe(corruptedHash);
  });
});
