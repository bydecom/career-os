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
  /** Union of focus nodes answered across the session (deduped). */
  coveredNodeIds: string[];
  /** Counts by ontology nodeType string — recruiter interest signal. */
  recruiterInterest: Record<string, number>;
}

const MAX_SESSIONS = 500;
const MAX_RECENT_TURNS = 3;
const MAX_FOCUS_NODES = 5;
const MAX_COVERED_NODES = 50;
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
      coveredNodeIds: (patch.coveredNodeIds ?? prev?.coveredNodeIds ?? []).slice(-MAX_COVERED_NODES),
      recruiterInterest: patch.recruiterInterest ?? prev?.recruiterInterest ?? {},
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

/**
 * Merge focus nodes into covered set + bump recruiterInterest by node type.
 */
export function accumulateSessionKnowledge(
  prev: ContextObject | undefined,
  focusNodeIds: string[],
  typeOf: (id: string) => string,
): Pick<ContextObject, 'coveredNodeIds' | 'recruiterInterest'> {
  const covered = new Set(prev?.coveredNodeIds ?? []);
  const interest: Record<string, number> = { ...(prev?.recruiterInterest ?? {}) };
  for (const id of focusNodeIds) {
    covered.add(id);
    const t = typeOf(id);
    interest[t] = (interest[t] ?? 0) + 1;
  }
  return {
    coveredNodeIds: Array.from(covered).slice(-MAX_COVERED_NODES),
    recruiterInterest: interest,
  };
}

/**
 * Rule-only next-best hint: highest-interest type among candidates.
 * Returns a nodeType string or null — never calls an LLM.
 */
export function suggestNextBestNodeType(
  context: ContextObject | undefined,
  availableTypes: string[],
): string | null {
  if (!context || availableTypes.length === 0) return null;
  const ranked = [...availableTypes].sort(
    (a, b) => (context.recruiterInterest[b] ?? 0) - (context.recruiterInterest[a] ?? 0),
  );
  return ranked[0] ?? null;
}

export const sessionContextStore = new SessionContextStore();
