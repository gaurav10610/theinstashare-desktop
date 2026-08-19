import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for local/cached model execution
env.allowLocalModels = true;
env.useBrowserCache = true;

export class WhisperTranscriber {
  private static transcriberInstance: any = null;
  private static isLoading = false;

  public static async getInstance(onProgress?: (progress: number) => void): Promise<any> {
    if (this.transcriberInstance) return this.transcriberInstance;

    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return this.transcriberInstance;
    }

    this.isLoading = true;
    try {
      this.transcriberInstance = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          progress_callback: (p: any) => {
            if (p.status === 'progress' && onProgress) {
              onProgress(Math.round(p.progress || 0));
            }
          }
        }
      );
      this.isLoading = false;
      return this.transcriberInstance;
    } catch (err) {
      this.isLoading = false;
      console.warn('[WhisperTranscriber] Failed to initialize local Whisper model:', err);
      return null;
    }
  }

  public static async transcribeAudio(audioData: Float32Array): Promise<string> {
    try {
      const transcriber = await this.getInstance();
      if (!transcriber) return '(Offline speech model not initialized)';

      const result = await transcriber(audioData);
      return result.text || '';
    } catch (err) {
      console.error('[WhisperTranscriber] Transcription error:', err);
      return '';
    }
  }
}
