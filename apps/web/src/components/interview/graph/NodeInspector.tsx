'use client';

import type { AskEdge, AskNode } from '@/lib/askTypes';
import { cn } from '@/lib/utils';
import { typeColor, typeLabel } from './typeColors';

export function NodeInspector({
  node,
  edges,
  nodes,
  onClose,
}: {
  node: AskNode;
  edges: AskEdge[];
  nodes: AskNode[];
  onClose: () => void;
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const colors = typeColor(node.type);

  const related = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((e) => {
      const otherId = e.source === node.id ? e.target : e.source;
      const other = byId.get(otherId);
      const direction = e.source === node.id ? 'out' : 'in';
      return {
        key: `${e.source}-${e.type}-${e.target}`,
        type: e.type,
        direction,
        otherName: other?.name ?? otherId,
        otherType: other?.type ?? 'unknown',
      };
    });

  return (
    <div className="rounded-md border border-border bg-background/80 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
            <span className={cn('font-mono text-[10px] uppercase tracking-wider', colors.text)}>
              {typeLabel(node.type)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-medium text-foreground">{node.name}</p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{node.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 font-mono text-[10px] text-muted-foreground hover:text-foreground"
        >
          close
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 font-mono text-[11px]">
        <div>
          <dt className="text-muted-foreground">RRF score</dt>
          <dd className="mt-0.5 text-foreground">{node.score.toFixed(4)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">engines</dt>
          <dd className="mt-0.5 text-foreground">{node.engines.join(' · ') || '—'}</dd>
        </div>
      </dl>

      {node.excerpt ? (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Excerpt
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{node.excerpt}</p>
        </div>
      ) : null}

      <div className="mt-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Edges ({related.length})
        </p>
        {related.length === 0 ? (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">No edges in this selection.</p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {related.map((r) => (
              <li key={r.key} className="flex items-baseline gap-2 font-mono text-[11px]">
                <span className="shrink-0 text-primary">{r.type}</span>
                <span className="text-muted-foreground">{r.direction === 'out' ? '→' : '←'}</span>
                <span className="min-w-0 truncate text-foreground">
                  <span className="text-muted-foreground">{typeLabel(r.otherType)} · </span>
                  {r.otherName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
