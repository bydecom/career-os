import { askCareerStream } from '@/lib/askCareer';
import type { StageEvent } from '@/lib/askTypes';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string; sessionId?: string };
  const question = body.question?.trim();
  if (!question) {
    return new Response(JSON.stringify({ error: 'question is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const sessionId = body.sessionId?.trim() || crypto.randomUUID();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: StageEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        await askCareerStream(question, sessionId, emit);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ask failed';
        emit({ stage: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
