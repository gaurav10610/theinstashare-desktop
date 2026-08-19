import { AISettings } from '../types';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIClient {
  public static async query(prompt: string, settings: AISettings, systemPrompt?: string): Promise<string> {
    const messages: AIMessage[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    switch (settings.provider) {
      case 'ollama':
        return this.queryOllama(messages, settings.ollamaUrl, settings.ollamaModel);
      case 'gemini':
        return this.queryGemini(messages, settings.apiKey);
      case 'openai':
        return this.queryOpenAI(messages, settings.apiKey, 'https://api.openai.com/v1/chat/completions', 'gpt-4o-mini');
      case 'groq':
        return this.queryOpenAI(messages, settings.apiKey, 'https://api.groq.com/openai/v1/chat/completions', 'llama-3.3-70b-versatile');
      case 'claude':
        return this.queryClaude(messages, settings.apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${settings.provider}`);
    }
  }

  private static async queryOllama(messages: AIMessage[], url = 'http://localhost:11434', model = 'llama3.2'): Promise<string> {
    const res = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json();
    return data.message?.content || '';
  }

  private static async queryGemini(messages: AIMessage[], apiKey: string): Promise<string> {
    if (!apiKey) throw new Error('Gemini API key is required');
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    if (!res.ok) throw new Error(`Gemini error: ${res.statusText}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private static async queryOpenAI(messages: AIMessage[], apiKey: string, endpoint: string, model: string): Promise<string> {
    if (!apiKey) throw new Error('API key is required');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages
      })
    });
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private static async queryClaude(messages: AIMessage[], apiKey: string): Promise<string> {
    if (!apiKey) throw new Error('Claude API key is required');
    const system = messages.find((m) => m.role === 'system')?.content;
    const userMessages = messages.filter((m) => m.role !== 'system');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system,
        messages: userMessages
      })
    });
    if (!res.ok) throw new Error(`Claude error: ${res.statusText}`);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }
}
