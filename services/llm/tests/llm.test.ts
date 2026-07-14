import { describe, it, expect, vi, afterEach } from 'vitest';
import { GeminiProvider } from '../src/providers/gemini.js';
import { createProvider } from '../src/createProvider.js';
import { SseParser } from '../src/sse/parseSse.js';
import { mapThinkingToGeminiBudget } from '../src/providers/gemini/thinkingMapper.js';
import { verbalize, VERBALIZE_SYSTEM_PROMPT } from '../src/verbalize.js';
import type { ChatRequest, ChatStreamChunk, LlmProvider } from '../src/types.js';
import type { ConversationIR } from '@career-os/conversation';

const sampleIr: ConversationIR = {
  question: 'Why RabbitMQ?',
  confidence: 0.9,
  anchorNodes: [
    {
      id: 'rabbitmq',
      type: 'technology',
      name: 'RabbitMQ',
      excerpt: 'Message broker',
      score: 0.08,
      engines: ['metadata', 'bm25'],
    },
  ],
  candidateNodes: [
    {
      id: 'rabbitmq',
      type: 'technology',
      name: 'RabbitMQ',
      excerpt: 'Message broker',
      score: 0.08,
      engines: ['metadata', 'bm25'],
    },
  ],
  edges: [],
  sections: [{ heading: 'Technologies', body: '### RabbitMQ (`rabbitmq`)\nMessage broker' }],
  retrievalTrace: [
    { nodeId: 'rabbitmq', name: 'RabbitMQ', engines: ['metadata', 'bm25'], selected: true, rank: 1 },
  ],
  tokenBudgetHint: 40,
};

function fakeProvider(overrides: Partial<LlmProvider> = {}): LlmProvider {
  return {
    name: 'fake',
    model: 'fake-model',
    capabilities: { streaming: true, tools: false, thinking: false, vision: false },
    async complete() {
      return { text: '' };
    },
    async *stream() {
      yield { type: 'done' as const };
    },
    ...overrides,
  };
}

describe('SseParser', () => {
  it('parses multi-line data frames and ignores event/id/retry', () => {
    const parser = new SseParser();
    const frames = parser.push(
      'event: message\nid: 1\nretry: 1000\ndata: {"a":1}\ndata: {"b":2}\n\n'
    );
    expect(frames).toHaveLength(1);
    expect(frames[0]!.event).toBe('message');
    expect(frames[0]!.data).toBe('{"a":1}\n{"b":2}');
  });
});

describe('GeminiThinkingMapper', () => {
  it('keeps Gemini budgets inside the adapter mapper only', () => {
    expect(mapThinkingToGeminiBudget('none')).toBe(0);
    expect(mapThinkingToGeminiBudget('medium')).toBe(8192);
    expect(mapThinkingToGeminiBudget(undefined)).toBeUndefined();
  });
});

describe('GeminiProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_MODEL;
  });

  it('throws without an apiKey', () => {
    expect(() => new GeminiProvider({ apiKey: '' })).toThrow(/apiKey/);
  });

  it('exposes capability flags', () => {
    const provider = new GeminiProvider({ apiKey: 'test-key' });
    expect(provider.capabilities).toEqual({
      streaming: true,
      tools: false,
      thinking: true,
      vision: false,
    });
  });

  it('uses GEMINI_MODEL from env when model is not passed', () => {
    process.env.GEMINI_MODEL = 'gemini-2.5-flash-lite';
    const provider = new GeminiProvider({ apiKey: 'test-key' });
    expect(provider.model).toBe('gemini-2.5-flash-lite');
  });

  it('returns normalized usage from generateContent', async () => {
    let capturedBody: any;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedBody = JSON.parse(init!.body as string);
        return {
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'RabbitMQ was used for async queues.' }] } }],
            usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20, totalTokenCount: 120 },
          }),
        };
      })
    );

    const provider = new GeminiProvider({ apiKey: 'test-key', model: 'gemini-2.5-flash' });
    const result = await provider.complete({
      system: 'sys',
      user: 'usr',
      temperature: 0.1,
      maxTokens: 512,
      thinking: 'none',
    });

    expect(result.text).toContain('RabbitMQ');
    expect(result.usage).toMatchObject({
      inputTokens: 100,
      outputTokens: 20,
      totalTokens: 120,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
    });
    expect(capturedBody.generationConfig.temperature).toBe(0.1);
    expect(capturedBody.generationConfig.maxOutputTokens).toBe(512);
    expect(capturedBody.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
    expect(capturedBody.safetySettings).toHaveLength(4);
    expect(capturedBody.systemInstruction).toBeDefined();
  });

  it('streams SSE deltas then a done chunk', async () => {
    const sse = [
      'data: {"candidates":[{"content":{"parts":[{"text":"Hello "}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":"world"}]}}],"usageMetadata":{"promptTokenCount":10,"candidatesTokenCount":2,"totalTokenCount":12}}\n\n',
    ].join('');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(sse));
            controller.close();
          },
        }),
      }))
    );

    const provider = new GeminiProvider({ apiKey: 'test-key' });
    const chunks: ChatStreamChunk[] = [];
    for await (const chunk of provider.stream({ system: 's', user: 'u' })) {
      chunks.push(chunk);
    }

    expect(chunks.filter((c) => c.type === 'delta').map((c) => (c as { text: string }).text).join('')).toBe(
      'Hello world'
    );
    expect(chunks.at(-1)).toMatchObject({ type: 'done', usage: { inputTokens: 10, outputTokens: 2 } });
  });

  it('throws on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 401, text: async () => 'unauthorized' }))
    );
    const provider = new GeminiProvider({ apiKey: 'test-key' });

    await expect(provider.complete({ system: 's', user: 'u' })).rejects.toThrow(/401/);
  });
});

describe('createProvider', () => {
  it('returns a GeminiProvider for provider: gemini', () => {
    const provider = createProvider({ provider: 'gemini', apiKey: 'k', model: 'gemini-2.5-flash' });
    expect(provider.name).toBe('gemini');
    expect(provider.model).toBe('gemini-2.5-flash');
    expect(provider.capabilities.streaming).toBe(true);
  });
});

describe('verbalize', () => {
  it('sends ConversationIR markdown and the knowledge-interface system prompt', async () => {
    let captured: ChatRequest | undefined;
    const fake = fakeProvider({
      async complete(req) {
        captured = req;
        return { text: 'Answer from IR only.' };
      },
    });

    const result = await verbalize(sampleIr, fake);

    expect(result.answer).toBe('Answer from IR only.');
    expect(result.provider).toBe('fake');
    expect(result.model).toBe('fake-model');
    expect(captured!.system).toBe(VERBALIZE_SYSTEM_PROMPT);
    expect(captured!.user).toContain('Why RabbitMQ?');
    expect(captured!.user).toContain('ConversationIR');
    expect(captured!.temperature).toBe(0.2);
    expect(captured!.thinking).toBe('minimal');
  });

  it('streams via onDelta when stream: true', async () => {
    const deltas: string[] = [];
    const fake = fakeProvider({
      async *stream() {
        yield { type: 'delta', text: 'Part ' };
        yield { type: 'delta', text: 'A' };
        yield { type: 'done', usage: { provider: 'fake', model: 'fake-model', outputTokens: 2 } };
      },
    });

    const result = await verbalize(sampleIr, fake, {
      stream: true,
      onDelta: (t) => deltas.push(t),
    });

    expect(deltas).toEqual(['Part ', 'A']);
    expect(result.answer).toBe('Part A');
  });
});
