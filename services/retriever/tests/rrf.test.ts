import { describe, it, expect } from 'vitest';
import { fuseRankings, ENGINE_WEIGHTS } from '../src/rrf.js';
import type { RankedList } from '../src/rrf.js';

describe('fuseRankings', () => {
  it('ranks a metadata-only match above a bm25-only match at the same rank', () => {
    const lists: RankedList[] = [
      { engine: 'metadata', nodeIds: ['a'] },
      { engine: 'bm25', nodeIds: ['b'] },
    ];

    const result = fuseRankings(lists);

    expect(result[0]!.nodeId).toBe('a');
    expect(result[0]!.score).toBeGreaterThan(result[1]!.score);
  });

  it('boosts a node that is verified by multiple engines above one verified by a single engine', () => {
    const lists: RankedList[] = [
      { engine: 'bm25', nodeIds: ['multi', 'single'] },
      { engine: 'graph', nodeIds: ['multi'] },
    ];

    const result = fuseRankings(lists);

    expect(result[0]!.nodeId).toBe('multi');
    expect(result.find((r) => r.nodeId === 'multi')!.contributions).toHaveLength(2);
  });

  it('applies the exact weighted formula from ADR-0006', () => {
    const k = 60;
    const lists: RankedList[] = [{ engine: 'graph', nodeIds: ['a'] }];

    const result = fuseRankings(lists, { k });

    expect(result[0]!.score).toBeCloseTo(ENGINE_WEIGHTS.graph / (k + 1), 10);
  });

  it('ranks context above graph and bm25 at the same rank, below metadata', () => {
    const lists: RankedList[] = [
      { engine: 'metadata', nodeIds: ['meta'] },
      { engine: 'context', nodeIds: ['ctx'] },
      { engine: 'graph', nodeIds: ['g'] },
      { engine: 'bm25', nodeIds: ['lex'] },
    ];

    const result = fuseRankings(lists);
    expect(result.map((r) => r.nodeId)).toEqual(['meta', 'ctx', 'g', 'lex']);
  });

  it('returns results sorted by score descending', () => {
    const lists: RankedList[] = [{ engine: 'bm25', nodeIds: ['a', 'b', 'c'] }];

    const result = fuseRankings(lists);

    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.score).toBeGreaterThanOrEqual(result[i]!.score);
    }
  });

  it('handles an empty input gracefully', () => {
    expect(fuseRankings([])).toEqual([]);
  });
});
