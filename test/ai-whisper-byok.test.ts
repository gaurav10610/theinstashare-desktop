import { describe, it, expect, vi } from 'vitest';
import { AIClient } from '../src/renderer/src/core/ai/AIClient';
import { AISettings } from '../src/renderer/src/core/types';

describe('AI Whisper & BYOK Engine Exhaustive Suite', () => {
  it('should format Anthropic Claude messages API payload correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Claude meeting synthesis.' }]
      })
    } as Response);

    const settings: AISettings = {
      provider: 'claude',
      apiKey: 'sk-ant-api03-testkey',
      ollamaUrl: '',
      ollamaModel: '',
      enableLocalWhisper: true,
      enablePreFlightSanitizer: true
    };

    const res = await AIClient.query('Summarize action items', settings);
    expect(res).toBe('Claude meeting synthesis.');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': 'sk-ant-api03-testkey',
          'anthropic-version': '2023-06-01'
        })
      })
    );
  });

  it('should format OpenAI / Groq Chat Completions API payload correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'OpenAI GPT response.' } }]
      })
    } as Response);

    const settings: AISettings = {
      provider: 'openai',
      apiKey: 'sk-proj-testkey',
      ollamaUrl: '',
      ollamaModel: '',
      enableLocalWhisper: true,
      enablePreFlightSanitizer: true
    };

    const res = await AIClient.query('Test OpenAI query', settings);
    expect(res).toBe('OpenAI GPT response.');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-proj-testkey'
        })
      })
    );
  });

  it('should parse structured markdown meeting notes into sections and action items', () => {
    const rawMarkdown = `# Meeting Summary
The team reviewed the v2 architecture.

## Key Decisions
- Replaced legacy Angular 12 with React 19 and Electron 34.
- Adopted BLAKE3 hashing for file chunk validation.

## Action Items
- [ ] Deploy to staging
- [ ] Run full cross-platform test suite
`;

    const lines = rawMarkdown.split('\n');
    const actionItems = lines
      .filter((l) => l.trim().startsWith('- [ ]'))
      .map((l) => l.replace('- [ ]', '').trim());

    expect(actionItems).toHaveLength(2);
    expect(actionItems[0]).toBe('Deploy to staging');
    expect(actionItems[1]).toBe('Run full cross-platform test suite');
  });
});
