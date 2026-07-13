import type { EdgeType } from '@career-os/ontology';
import type { Adjacency } from './adjacency.js';

// ---------------------------------------------------------------------------
// Edge-type-filtered BFS traversal.
//
// The Knowledge Model (docs/02-architecture/02-knowledge-model.md) defines
// strict ontology reasoning paths, e.g.:
//   Technology --ENABLES--> Decision --IMPLEMENTS--> Project
// This traversal lets the retriever walk exactly those paths deterministically,
// instead of following every edge type indiscriminately.
// ---------------------------------------------------------------------------

export interface TraversalHop {
  nodeId: string;
  depth: number;
  /** The edge that led to this node, undefined for the start node. */
  viaEdgeId?: string;
  viaEdgeType?: EdgeType;
}

export interface TraverseOptions {
  /** Which edge types to follow. If omitted, all edge types are followed. */
  edgeTypes?: EdgeType[];
  /** Max BFS depth. Default 3. */
  maxDepth?: number;
  /** Which direction to walk. Default 'forward'. */
  direction?: 'forward' | 'reverse' | 'bidirectional';
}

/**
 * BFS from `startId`, optionally restricted to a whitelist of edge types.
 * Returns every reachable node with the depth and edge used to reach it
 * (first hop found wins, since this is a plain BFS).
 */
export function traverseByEdgeType(
  adjacency: Adjacency,
  startId: string,
  options: TraverseOptions = {}
): TraversalHop[] {
  const { edgeTypes, maxDepth = 3, direction = 'forward' } = options;

  if (!adjacency.nodeIds.has(startId)) return [];

  const visited = new Set<string>([startId]);
  const result: TraversalHop[] = [{ nodeId: startId, depth: 0 }];
  let frontier: TraversalHop[] = result.slice();

  for (let depth = 1; depth <= maxDepth && frontier.length > 0; depth++) {
    const nextFrontier: TraversalHop[] = [];

    for (const hop of frontier) {
      const outgoing = direction !== 'reverse' ? adjacency.forward.get(hop.nodeId) ?? [] : [];
      const incoming = direction !== 'forward' ? adjacency.reverse.get(hop.nodeId) ?? [] : [];

      for (const entry of [...outgoing, ...incoming]) {
        if (visited.has(entry.nodeId)) continue;
        if (edgeTypes && !edgeTypes.includes(entry.edge.type)) continue;

        visited.add(entry.nodeId);
        const next: TraversalHop = {
          nodeId: entry.nodeId,
          depth,
          viaEdgeId: entry.edge.id,
          viaEdgeType: entry.edge.type,
        };
        result.push(next);
        nextFrontier.push(next);
      }
    }

    frontier = nextFrontier;
  }

  return result;
}
