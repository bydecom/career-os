import type { KnowledgeGraph, KnowledgeEdge } from '@career-os/ontology';

// ---------------------------------------------------------------------------
// Adjacency — builds forward + reverse adjacency lists from a KnowledgeGraph
// so graph algorithms (PPR, traversal) never have to re-scan the edge list.
// ---------------------------------------------------------------------------

export interface AdjacencyEntry {
  nodeId: string;
  edge: KnowledgeEdge;
}

export interface Adjacency {
  /** nodeId -> outgoing edges (this node is the sourceNode) */
  forward: Map<string, AdjacencyEntry[]>;
  /** nodeId -> incoming edges (this node is the targetNode) */
  reverse: Map<string, AdjacencyEntry[]>;
  /** All known node IDs (including orphans with no edges) */
  nodeIds: Set<string>;
}

function pushEntry(map: Map<string, AdjacencyEntry[]>, key: string, entry: AdjacencyEntry): void {
  const list = map.get(key);
  if (list) {
    list.push(entry);
  } else {
    map.set(key, [entry]);
  }
}

export function buildAdjacency(graph: KnowledgeGraph): Adjacency {
  const forward = new Map<string, AdjacencyEntry[]>();
  const reverse = new Map<string, AdjacencyEntry[]>();
  const nodeIds = new Set<string>(graph.nodes.map((n) => n.id));

  for (const edge of graph.edges) {
    pushEntry(forward, edge.sourceNode, { nodeId: edge.targetNode, edge });
    pushEntry(reverse, edge.targetNode, { nodeId: edge.sourceNode, edge });
  }

  return { forward, reverse, nodeIds };
}
