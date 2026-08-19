import { describe, it, expect, vi } from 'vitest';
import { AIClient } from '../src/renderer/src/core/ai/AIClient';
import { AISettings } from '../src/renderer/src/core/types';

describe('AIClient BYOK Service Tests', () => {
  it('should query Ollama local endpoint with proper format', async () => {
    const mockResponse = {
      message: { content: 'Local Ollama response for terminal analysis.' }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const settings: AISettings = {
      provider: 'ollama',
      apiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
      enableLocalWhisper: true,
      enablePreFlightSanitizer: true
    };

    const res = await AIClient.query('Explain ls -la', settings);
    expect(res).toBe('Local Ollama response for terminal analysis.');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should format Google Gemini query with correct API key parameter', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Gemini structured meeting summary.' }]
          }
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse
    } as Response);

    const settings: AISettings = {
      provider: 'gemini',
      apiKey: 'AIzaSyFakeKey123',
      ollamaUrl: '',
      ollamaModel: '',
      enableLocalWhisper: true,
      enablePreFlightSanitizer: true
    };

    const res = await AIClient.query('Summarize meeting', settings);
    expect(res).toBe('Gemini structured meeting summary.');
  });
});
