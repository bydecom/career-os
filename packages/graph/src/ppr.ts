import type { Adjacency } from './adjacency.js';

// ---------------------------------------------------------------------------
// Personalized PageRank (PPR) — power iteration over the Knowledge Graph.
//
// Standard PageRank answers "what is globally important?". PPR answers
// "what is important RELATIVE to these seed nodes?" — which is exactly what
// Progressive Certainty Retrieval needs once Metadata Lookup has anchored a
// query to one or more concrete node IDs (see ADR-0004).
//
// `direction: 'bidirectional'` walks both outgoing and incoming edges. This
// matters in practice: a query anchored on a Technology node (e.g. "redis")
// needs to reach Projects that USE it (an incoming edge from the Project's
// perspective), not just nodes Redis points to. The medical-citation-agent
// project measured 0.98 vs 0.27 Precision@10 switching from unidirectional
// to bidirectional PPR — this implementation defaults to bidirectional.
// ---------------------------------------------------------------------------

export type PprDirection = 'forward' | 'reverse' | 'bidirectional';

export interface PprOptions {
  /** Probability of following an edge vs. teleporting back to a seed. Default 0.85. */
  dampingFactor?: number;
  /** Which edges to walk. Default 'bidirectional'. */
  direction?: PprDirection;
  /** Max power-iteration steps. Default 20. */
  maxIterations?: number;
  /** Stop early once the L1 delta between iterations drops below this. Default 1e-6. */
  tolerance?: number;
}

export interface PprResult {
  /** nodeId -> PPR score, sorted descending is left to the caller. */
  scores: Map<string, number>;
}

const DEFAULTS: Required<PprOptions> = {
  dampingFactor: 0.85,
  direction: 'bidirectional',
  maxIterations: 20,
  tolerance: 1e-6,
};

function neighborsOf(adjacency: Adjacency, nodeId: string, direction: PprDirection): string[] {
  const out: string[] = [];
  if (direction === 'forward' || direction === 'bidirectional') {
    for (const entry of adjacency.forward.get(nodeId) ?? []) out.push(entry.nodeId);
  }
  if (direction === 'reverse' || direction === 'bidirectional') {
    for (const entry of adjacency.reverse.get(nodeId) ?? []) out.push(entry.nodeId);
  }
  return out;
}

/**
 * Runs Personalized PageRank seeded at `seedIds`.
 *
 * Nodes unreachable from every seed will simply never accumulate score above 0.
 */
export function personalizedPageRank(
  adjacency: Adjacency,
  seedIds: string[],
  options: PprOptions = {}
): PprResult {
  const { dampingFactor, direction, maxIterations, tolerance } = { ...DEFAULTS, ...options };

  const validSeeds = seedIds.filter((id) => adjacency.nodeIds.has(id));
  if (validSeeds.length === 0) {
    return { scores: new Map() };
  }

  const nodeIds = Array.from(adjacency.nodeIds);
  const teleportMass = 1 / validSeeds.length;
  const teleport = new Map<string, number>(validSeeds.map((id) => [id, teleportMass]));

  // Precompute out-degree per node for the chosen direction (dangling nodes
  // redistribute their mass fully back to the teleport set).
  const outDegree = new Map<string, number>();
  for (const id of nodeIds) {
    outDegree.set(id, neighborsOf(adjacency, id, direction).length);
  }

  let scores = new Map<string, number>(nodeIds.map((id) => [id, teleport.get(id) ?? 0]));

  for (let iter = 0; iter < maxIterations; iter++) {
    const next = new Map<string, number>(nodeIds.map((id) => [id, (1 - dampingFactor) * (teleport.get(id) ?? 0)]));

    let danglingMass = 0;
    for (const id of nodeIds) {
      const score = scores.get(id) ?? 0;
      const degree = outDegree.get(id) ?? 0;
      if (degree === 0) {
        danglingMass += score;
        continue;
      }
      const share = (dampingFactor * score) / degree;
      for (const neighborId of neighborsOf(adjacency, id, direction)) {
        next.set(neighborId, (next.get(neighborId) ?? 0) + share);
      }
    }

    // Redistribute dangling mass proportionally to the teleport distribution.
    if (danglingMass > 0) {
      for (const [seedId, mass] of teleport) {
        next.set(seedId, (next.get(seedId) ?? 0) + dampingFactor * danglingMass * mass);
      }
    }

    let delta = 0;
    for (const id of nodeIds) {
      delta += Math.abs((next.get(id) ?? 0) - (scores.get(id) ?? 0));
    }

    scores = next;
    if (delta < tolerance) break;
  }

  return { scores };
}
