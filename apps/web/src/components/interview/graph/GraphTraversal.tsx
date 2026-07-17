'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { AskEdge, AskNode } from '@/lib/askTypes';
import { KnowledgeNode } from './KnowledgeNode';
import { layoutKnowledgeGraph } from './layoutGraph';
import { NodeInspector } from './NodeInspector';
import { typeColor, typeLabel } from './typeColors';

const nodeTypes = { knowledge: KnowledgeNode };

function GraphCanvas({
  nodes,
  edges,
  onSelect,
}: {
  nodes: AskNode[];
  edges: AskEdge[];
  onSelect: (id: string | null) => void;
}) {
  const layout = useMemo(() => layoutKnowledgeGraph(nodes, edges), [nodes, edges]);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(layout.nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setRfNodes(layout.nodes);
    setRfEdges(layout.edges);
    onSelect(null);
  }, [layout, setRfNodes, setRfEdges, onSelect]);

  const onSelectionChange = useCallback(
    ({ nodes: selected }: OnSelectionChangeParams) => {
      onSelect(selected[0]?.id ?? null);
    },
    [onSelect],
  );

  if (nodes.length === 0) {
    return (
      <p className="px-1 py-4 font-mono text-[11px] text-muted-foreground">
        No selected nodes yet.
      </p>
    );
  }

  return (
    <div className="h-64 w-full overflow-hidden rounded-md border border-border bg-zinc-950/60">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={1.6}
        nodesConnectable={false}
        nodesDraggable
        elementsSelectable
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background gap={16} size={1} color="#27272a" />
        <Controls
          showInteractive={false}
          className="!m-2 !overflow-hidden !rounded-md !border !border-border !bg-card !shadow-none [&>button]:!border-border [&>button]:!bg-background [&>button]:!fill-muted"
        />
      </ReactFlow>
    </div>
  );
}

export function GraphTraversal({ nodes, edges }: { nodes: AskNode[]; edges: AskEdge[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  const typesPresent = useMemo(() => {
    const set = new Set(nodes.map((n) => n.type));
    return Array.from(set);
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <p className="font-mono text-[11px] text-muted-foreground">
        Waiting for retrieval to select evidence nodes…
      </p>
    );
  }

  const connected = edges.filter(
    (e) => nodes.some((n) => n.id === e.source) && nodes.some((n) => n.id === e.target),
  ).length;

  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] text-muted-foreground">
        {nodes.length} nodes · {connected} edges · click a node to inspect · drag to rearrange
      </p>

      <div className="flex flex-wrap gap-2">
        {typesPresent.map((t) => {
          const c = typeColor(t);
          return (
            <span
              key={t}
              className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
              {typeLabel(t)}
            </span>
          );
        })}
      </div>

      <ReactFlowProvider>
        <GraphCanvas nodes={nodes} edges={edges} onSelect={setSelectedId} />
      </ReactFlowProvider>

      {selected ? (
        <NodeInspector
          node={selected}
          edges={edges}
          nodes={nodes}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        <p className="font-mono text-[10px] text-muted-foreground">
          Select a node to see score, engines, excerpt, and edges.
        </p>
      )}
    </div>
  );
}
