'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { applyStageEvent, emptyAskResult, type AskResult, type StageEvent } from '@/lib/askTypes';
import { RuntimeTrace } from './RuntimeTrace';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTIONS = [
  'Tell me about CareerOS',
  'What is GraphRAG-Code?',
  'How does CareerOS avoid hallucination?',
  'Explain the conversational state machine',
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function InterviewWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inspection, setInspection] = useState<AskResult | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}`,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    setError(null);
    setInput('');
    setMessages((prev) => [...prev, { id: uid(), role: 'user', content: q }]);
    setLoading(true);

    let result = emptyAskResult(q);
    setInspection(result);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, sessionId: sessionIdRef.current }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Ask failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let errorMessage: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as StageEvent;
          if (event.stage === 'error') {
            errorMessage = event.message;
            continue;
          }
          result = applyStageEvent(result, event);
          setInspection(result);
        }
      }

      if (errorMessage) throw new Error(errorMessage);
      if (!result.answer) throw new Error('Ask failed');

      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: result.answer! }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ask failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold tracking-tight md:text-base">
            Watch CareerOS execute.
          </h1>
          <span className="rounded border border-primary/30 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            Phase 2 Beta
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          Chat is the input. The Execution Trace on the right shows every real step the runtime takes.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,42%)_minmax(0,58%)] lg:grid-rows-none lg:grid-cols-[minmax(0,0.85fr)_minmax(340px,1.15fr)]">
        {/* Chat */}
        <section className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-border/60 px-4 py-2 md:px-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Chat
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-5">
            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/20 px-4 py-6">
                <p className="text-sm text-muted">
                  This is not ChatGPT with a skin. Every answer is traced: retrieval → graph →
                  ConversationIR → prompt → LLM. Watch it run on the right.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void ask(s)}
                      className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted transition hover:border-primary/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((m) => (
              <article
                key={m.id}
                className={cn(
                  'rounded-lg border px-3.5 py-3 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'ml-6 border-primary/30 bg-primary/[0.06]'
                    : 'mr-2 border-border bg-card/40',
                )}
              >
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.role === 'user' ? 'You' : 'CareerOS'}
                </p>
                <p className="whitespace-pre-wrap text-foreground/90">{m.content}</p>
              </article>
            ))}

            {loading ? (
              <p className="font-mono text-[11px] text-muted-foreground">
                Retrieving evidence…
              </p>
            ) : null}
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="flex shrink-0 gap-2 border-t border-border bg-background/80 px-4 py-3 md:px-5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              disabled={loading}
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </section>

        {/* Runtime Trace — the product */}
        <aside className="flex min-h-0 flex-col bg-card/20">
          <div className="shrink-0 border-b border-border/60 px-5 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Execution Trace
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <RuntimeTrace inspection={inspection} loading={loading} />
          </div>
        </aside>
      </div>
    </div>
  );
}
