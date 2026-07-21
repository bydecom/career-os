// ---------------------------------------------------------------------------
// Session context — minimal persistent object across interview turns.
// In-memory only (single Next.js process). Evicts by LRU + idle TTL.
// ---------------------------------------------------------------------------

export { detectContinuation } from '@career-os/conversation';

export type TurnRecord = {
  question: string;
  answer: string;
  focusNodeIds: string[];
};

export interface ContextObject {
  turn: number;
  focusNodeIds: string[];
  lastIntent: string;
  recentTurns: TurnRecord[];
  updatedAt: number;
}

const MAX_SESSIONS = 500;
const MAX_RECENT_TURNS = 3;
const MAX_FOCUS_NODES = 5;
const IDLE_TTL_MS = 30 * 60 * 1000;

export class SessionContextStore {
  private readonly contexts = new Map<string, ContextObject>();

  get(sessionId: string): ContextObject | undefined {
    this.evictStale();
    return this.contexts.get(sessionId);
  }

  update(sessionId: string, patch: Partial<Omit<ContextObject, 'updatedAt'>>): void {
    const prev = this.contexts.get(sessionId);
    const next: ContextObject = {
      turn: patch.turn ?? prev?.turn ?? 0,
      focusNodeIds: (patch.focusNodeIds ?? prev?.focusNodeIds ?? []).slice(0, MAX_FOCUS_NODES),
      lastIntent: patch.lastIntent ?? prev?.lastIntent ?? '',
      recentTurns: (patch.recentTurns ?? prev?.recentTurns ?? []).slice(-MAX_RECENT_TURNS),
      updatedAt: Date.now(),
    };
    this.contexts.set(sessionId, next);
    this.evictOverflow();
  }

  /** Exposed for tests. */
  size(): number {
    return this.contexts.size;
  }

  /** Exposed for tests — clear all sessions. */
  clear(): void {
    this.contexts.clear();
  }

  private evictStale(): void {
    const cutoff = Date.now() - IDLE_TTL_MS;
    for (const [id, ctx] of this.contexts) {
      if (ctx.updatedAt < cutoff) this.contexts.delete(id);
    }
  }

  private evictOverflow(): void {
    if (this.contexts.size <= MAX_SESSIONS) return;
    const ranked = Array.from(this.contexts.entries()).sort(
      (a, b) => a[1].updatedAt - b[1].updatedAt,
    );
    const toDrop = this.contexts.size - MAX_SESSIONS;
    for (let i = 0; i < toDrop; i++) {
      this.contexts.delete(ranked[i]![0]);
    }
  }
}

export const sessionContextStore = new SessionContextStore();
