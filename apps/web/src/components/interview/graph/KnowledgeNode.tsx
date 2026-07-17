'use client';

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { KnowledgeNodeData } from './layoutGraph';
import { typeColor, typeLabel } from './typeColors';

type KnNode = Node<KnowledgeNodeData, 'knowledge'>;

export function KnowledgeNode({ data, selected }: NodeProps<KnNode>) {
  const colors = typeColor(data.type);

  return (
    <div
      className={cn(
        'w-[168px] rounded-md border px-2.5 py-2 shadow-sm transition',
        colors.bg,
        colors.border,
        selected ? 'ring-2 ring-primary/70 ring-offset-1 ring-offset-background' : '',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-500"
      />
      <div className="flex items-center gap-1.5">
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', colors.dot)} />
        <span className={cn('font-mono text-[9px] uppercase tracking-wider', colors.text)}>
          {typeLabel(data.type)}
        </span>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground">
          {data.score.toFixed(3)}
        </span>
      </div>
      <p className="mt-1 truncate text-[11px] font-medium leading-tight text-foreground">
        {data.name}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-zinc-500"
      />
    </div>
  );
}
