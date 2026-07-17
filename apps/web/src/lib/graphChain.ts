import type { AskEdge, AskNode } from './askTypes';

export type ChainHop = {
  node: AskNode;
  /** Edge type connecting the previous hop to this node (undefined for the first hop). */
  via?: string;
};

/**
 * Walks the real retrieved edges to build a short, real traversal path —
 * not a decorative graph. Starts at the strongest project/anchor node.
 */
export function buildGraphChain(nodes: AskNode[], edges: AskEdge[], maxHops = 5): ChainHop[] {
  if (nodes.length === 0) return [];

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const start =
    nodes.find((n) => n.type === 'project') ?? nodes.find((n) => n.type === 'experience') ?? nodes[0]!;

  const chain: ChainHop[] = [{ node: start }];
  const visited = new Set([start.id]);

  let current = start;
  while (chain.length < maxHops) {
    const nextEdge = edges.find(
      (e) =>
        (e.source === current.id && byId.has(e.target) && !visited.has(e.target)) ||
        (e.target === current.id && byId.has(e.source) && !visited.has(e.source)),
    );
    if (!nextEdge) break;

    const nextId = nextEdge.source === current.id ? nextEdge.target : nextEdge.source;
    const nextNode = byId.get(nextId);
    if (!nextNode) break;

    chain.push({ node: nextNode, via: nextEdge.type });
    visited.add(nextId);
    current = nextNode;
  }

  return chain;
}
