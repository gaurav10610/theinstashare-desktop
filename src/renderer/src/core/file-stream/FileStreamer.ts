import { calculateChunkHash } from '../crypto/hashing';

export const CHUNK_SIZE = 64 * 1024; // 64 KB per chunk
export const BUFFER_THRESHOLD = 256 * 1024; // 256 KB backpressure limit

export interface ChunkMetadata {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  chunkHash: string;
  byteOffset: number;
}

export class FileStreamer {
  public static async streamFile(
    file: File,
    fileId: string,
    dataChannel: RTCDataChannel,
    onProgress: (progress: number, speed: number) => void,
    signal?: AbortSignal
  ): Promise<string> {
    if (file.size === 0) {
      onProgress(100, 0);
      return fileId;
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let offset = 0;
    let chunkIndex = 0;
    let bytesSent = 0;
    let startTime = Date.now();
    let lastTime = startTime;
    let lastBytes = 0;

    dataChannel.bufferedAmountLowThreshold = BUFFER_THRESHOLD;

    while (offset < file.size) {
      if (signal?.aborted) {
        throw new Error('File transfer aborted by user');
      }

      // Check backpressure on RTCDataChannel
      if (dataChannel.bufferedAmount > BUFFER_THRESHOLD) {
        await new Promise<void>((resolve) => {
          const handler = () => {
            dataChannel.removeEventListener('bufferedamountlow', handler);
            resolve();
          };
          dataChannel.addEventListener('bufferedamountlow', handler);
        });
      }

      const chunkBlob = file.slice(offset, offset + CHUNK_SIZE);
      const arrayBuffer = await chunkBlob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const chunkHash = calculateChunkHash(uint8);

      const metadata: ChunkMetadata = {
        fileId,
        chunkIndex,
        totalChunks,
        chunkHash,
        byteOffset: offset
      };

      // Header prefix: 4 bytes metadata length + metadata JSON + raw binary payload
      const metaStr = JSON.stringify(metadata);
      const metaBytes = new TextEncoder().encode(metaStr);
      const packet = new Uint8Array(4 + metaBytes.length + uint8.length);

      // Write 4-byte big-endian length
      new DataView(packet.buffer).setUint32(0, metaBytes.length, false);
      packet.set(metaBytes, 4);
      packet.set(uint8, 4 + metaBytes.length);

      dataChannel.send(packet.buffer);

      offset += CHUNK_SIZE;
      chunkIndex++;
      bytesSent += uint8.length;

      // Speed calculation every 200ms
      const now = Date.now();
      if (now - lastTime >= 200 || offset >= file.size) {
        const deltaSec = (now - lastTime) / 1000;
        const speed = (bytesSent - lastBytes) / (deltaSec || 0.001);
        const progress = Math.min(100, (bytesSent / file.size) * 100);
        onProgress(parseFloat(progress.toFixed(1)), Math.round(speed));

        lastTime = now;
        lastBytes = bytesSent;
      }
    }

    return fileId;
  }
}
