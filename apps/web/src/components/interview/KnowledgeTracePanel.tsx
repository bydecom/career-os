'use client';

import type { ReactNode } from 'react';
import type { KnowledgeTrace, KnowledgeTraceNode } from '@/lib/askTypes';
import { typeLabel } from './graph/typeColors';

function TraceRow({ node }: { node: KnowledgeTraceNode }) {
  return (
    <li className="flex items-baseline gap-2 font-mono text-[11px]">
      <span className="shrink-0 text-primary">✓</span>
      <span className="min-w-0 truncate text-foreground">
        <span className="text-muted-foreground">{typeLabel(node.type)} · </span>
        {node.name}
      </span>
    </li>
  );
}

function Section({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{title}</p>
      {empty ? (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">None.</p>
      ) : (
        <ul className="mt-1.5 space-y-1">{children}</ul>
      )}
    </div>
  );
}

/**
 * Curated Knowledge Used panel — Direct Matches / Supporting / Additional.
 * Presentation only; does not re-run retrieval.
 */
export function KnowledgeTracePanel({ trace }: { trace: KnowledgeTrace }) {
  const { directMatches, supportingContext, additionalContext } = trace;

  return (
    <div className="space-y-3">
      <Section title="Direct Matches" empty={directMatches.length === 0}>
        {directMatches.map((n) => (
          <TraceRow key={n.id} node={n} />
        ))}
      </Section>

      <Section title="Supporting Context" empty={supportingContext.length === 0}>
        {supportingContext.map((n) => (
          <TraceRow key={n.id} node={n} />
        ))}
      </Section>

      {additionalContext.count > 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Additional Context
          </p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
            +{additionalContext.count} more in context
            {additionalContext.names.length > 0
              ? `: ${additionalContext.names.join(', ')}${
                  additionalContext.count > additionalContext.names.length ? '…' : ''
                }`
              : ''}
          </p>
        </div>
      ) : null}
    </div>
  );
}
