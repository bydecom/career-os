import type {
  ChatRequest,
  ChatResult,
  ChatStreamChunk,
  LlmCapabilities,
  LlmProvider,
  LlmUsage,
} from '../types.js';
import { SseParser } from '../sse/parseSse.js';
import { toGeminiRequest } from './gemini/requestMapper.js';
import { extractText, toLlmUsage, type GeminiGenerateContentResponse } from './gemini/responseMapper.js';

// ---------------------------------------------------------------------------
// Gemini chat adapter — thin Ports & Adapters shell over REST + fetch.
// Mapping / SSE parsing live in sibling modules so this file stays boring.
// ---------------------------------------------------------------------------

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash';

export interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini';
  readonly model: string;
  readonly capabilities: LlmCapabilities = {
    streaming: true,
    tools: false, // reserved — ChatRequest.tools ignored until wired
    thinking: true,
    vision: false, // not exposed in ChatRequest yet
  };

  private readonly apiKey: string;

  constructor(options: GeminiProviderOptions) {
    if (!options.apiKey) {
      throw new Error('GeminiProvider requires an apiKey (set GEMINI_API_KEY).');
    }
    this.apiKey = options.apiKey;
    this.model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  }

  async complete(request: ChatRequest): Promise<ChatResult> {
    const url = `${API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toGeminiRequest(request)),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini generateContent failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as GeminiGenerateContentResponse;
    const text = extractText(data).trim();
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    return {
      text,
      usage: toLlmUsage(data.usageMetadata, this.name, this.model),
    };
  }

  async *stream(request: ChatRequest): AsyncIterable<ChatStreamChunk> {
    const url = `${API_BASE}/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toGeminiRequest(request)),
    });

    if (!response.ok || !response.body) {
      const body = await response.text();
      throw new Error(`Gemini streamGenerateContent failed (${response.status}): ${body}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const parser = new SseParser();
    let lastUsage: LlmUsage | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      for (const frame of parser.push(decoder.decode(value, { stream: true }))) {
        if (frame.data === '[DONE]') continue;
        let data: GeminiGenerateContentResponse;
        try {
          data = JSON.parse(frame.data) as GeminiGenerateContentResponse;
        } catch {
          continue;
        }
        const delta = extractText(data);
        if (delta) yield { type: 'delta', text: delta };
        const usage = toLlmUsage(data.usageMetadata, this.name, this.model);
        if (usage) lastUsage = usage;
      }
    }

    for (const frame of parser.flush()) {
      if (frame.data === '[DONE]') continue;
      try {
        const data = JSON.parse(frame.data) as GeminiGenerateContentResponse;
        const delta = extractText(data);
        if (delta) yield { type: 'delta', text: delta };
        const usage = toLlmUsage(data.usageMetadata, this.name, this.model);
        if (usage) lastUsage = usage;
      } catch {
        // ignore trailing garbage
      }
    }

    yield { type: 'done', usage: lastUsage };
  }
}
