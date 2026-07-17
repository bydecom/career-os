import type { Edge, Node } from '@xyflow/react';
import type { AskEdge, AskNode } from '@/lib/askTypes';

export type KnowledgeNodeData = {
  name: string;
  type: string;
  score: number;
  engines: string[];
  excerpt: string;
};

const NODE_W = 168;
const NODE_H = 64;
const GAP_X = 36;
const GAP_Y = 88;

/**
 * Layout selected evidence nodes as a real graph (not a linear chain).
 * BFS layers from the strongest node; siblings fan out horizontally.
 */
export function layoutKnowledgeGraph(
  nodes: AskNode[],
  edges: AskEdge[],
): { nodes: Node<KnowledgeNodeData>[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes: [], edges: [] };

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const idSet = new Set(byId.keys());
  const relevant = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));

  const adj = new Map<string, string[]>();
  for (const id of idSet) adj.set(id, []);
  for (const e of relevant) {
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  }

  const start =
    [...nodes].sort((a, b) => b.score - a.score).find((n) => n.type === 'project') ??
    [...nodes].sort((a, b) => b.score - a.score)[0]!;

  const depth = new Map<string, number>();
  const queue = [start.id];
  depth.set(start.id, 0);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const d = depth.get(cur)!;
    for (const next of adj.get(cur) ?? []) {
      if (depth.has(next)) continue;
      depth.set(next, d + 1);
      queue.push(next);
    }
  }

  // Orphans (no path from start) — place in their own column to the right.
  let orphanDepth = 0;
  for (const n of nodes) {
    if (!depth.has(n.id)) {
      depth.set(n.id, orphanDepth);
      orphanDepth += 1;
    }
  }

  const layers = new Map<number, string[]>();
  for (const [id, d] of depth) {
    const list = layers.get(d) ?? [];
    list.push(id);
    layers.set(d, list);
  }

  for (const [, list] of layers) {
    list.sort((a, b) => (byId.get(b)?.score ?? 0) - (byId.get(a)?.score ?? 0));
  }

  const maxLayerSize = Math.max(...Array.from(layers.values()).map((l) => l.length), 1);
  const canvasW = maxLayerSize * (NODE_W + GAP_X);

  const rfNodes: Node<KnowledgeNodeData>[] = [];
  for (const [d, list] of layers) {
    const rowW = list.length * NODE_W + (list.length - 1) * GAP_X;
    const startX = (canvasW - rowW) / 2;
    list.forEach((id, i) => {
      const n = byId.get(id)!;
      rfNodes.push({
        id,
        type: 'knowledge',
        position: { x: startX + i * (NODE_W + GAP_X), y: d * (NODE_H + GAP_Y) },
        data: {
          name: n.name,
          type: n.type,
          score: n.score,
          engines: n.engines,
          excerpt: n.excerpt,
        },
        selected: false,
      });
    });
  }

  const seen = new Set<string>();
  const rfEdges: Edge[] = [];
  for (const e of relevant) {
    const key = `${e.source}->${e.target}:${e.type}`;
    const rev = `${e.target}->${e.source}:${e.type}`;
    if (seen.has(key) || seen.has(rev)) continue;
    seen.add(key);
    rfEdges.push({
      id: key,
      source: e.source,
      target: e.target,
      label: e.type,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#3f3f46', strokeWidth: 1.5 },
      labelStyle: { fill: '#71717a', fontSize: 9, fontFamily: 'ui-monospace, monospace' },
      labelBgStyle: { fill: '#09090b', fillOpacity: 0.85 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 2,
    });
  }

  return { nodes: rfNodes, edges: rfEdges };
}
