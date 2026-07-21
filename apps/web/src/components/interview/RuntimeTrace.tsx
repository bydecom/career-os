'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { AskResult, EngineMatch, FusedMatch } from '@/lib/askTypes';
import { GraphTraversal } from './graph/GraphTraversal';
import { typeLabel } from './graph/typeColors';
import { KnowledgeTracePanel } from './KnowledgeTracePanel';

function label(type: string) {
  return typeLabel(type);
}

function fmtScore(n: number | undefined) {
  return n === undefined ? '—' : n.toFixed(3);
}

/** Collapsible container — a "box" in the Execution Trace, closed by default except the header row. */
function Box({
  title,
  meta,
  defaultOpen = false,
  children,
}: {
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-border/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="text-primary">{open ? '▾' : '▸'}</span>
          {title}
        </span>
        {meta ? <span className="font-mono text-[10px] text-muted-foreground">{meta}</span> : null}
      </button>
      {open ? <div className="border-t border-border/60 px-3 py-2.5">{children}</div> : null}
    </div>
  );
}

function MatchList({
  matches,
  showMatch,
  max = 5,
}: {
  matches: EngineMatch[];
  showMatch?: boolean;
  max?: number;
}) {
  if (matches.length === 0) {
    return <p className="font-mono text-[11px] text-muted-foreground">No matches.</p>;
  }
  const visible = matches.slice(0, max);
  const remaining = matches.length - visible.length;
  return (
    <ul className="space-y-1.5">
      {visible.map((m) => (
        <li key={m.nodeId} className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
          <span className="min-w-0 truncate text-foreground">
            {label(m.type)}.{m.name}
          </span>
          <span className="shrink-0 text-muted-foreground">
            {m.score !== undefined ? fmtScore(m.score) : showMatch ? `"${m.matchedTerm}" · ${m.matchedField}` : ''}
          </span>
        </li>
      ))}
      {remaining > 0 ? (
        <li className="font-mono text-[10px] text-muted-foreground">+{remaining} more</li>
      ) : null}
    </ul>
  );
}

function Stage({
  index,
  title,
  meta,
  pending,
  children,
  isLast,
}: {
  index: number;
  title: string;
  meta?: string;
  pending?: boolean;
  children?: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-3 px-5 pb-6 pt-1">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]',
            pending
              ? 'animate-pulse border-border text-muted-foreground'
              : 'border-primary/40 bg-primary/10 text-primary',
          )}
        >
          {index}
        </span>
        {!isLast ? <span className="mt-1 min-h-[16px] w-px flex-1 bg-border" /> : null}
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={cn(
              'font-mono text-[11px] uppercase tracking-wider',
              pending ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {title}
          </p>
          {meta ? (
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{meta}</span>
          ) : null}
        </div>
        {pending ? (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">running…</p>
        ) : (
          <div className="mt-2 space-y-2 text-sm">{children}</div>
        )}
      </div>
    </div>
  );
}

function FusionTable({ fusion }: { fusion: FusedMatch[] }) {
  const top = fusion.slice(0, 10);
  return (
    <div className="space-y-1">
      {top.map((f, i) => (
        <div
          key={f.nodeId}
          className={cn(
            'flex items-center justify-between gap-2 rounded px-1.5 py-1 font-mono text-[11px]',
            f.selected ? 'bg-primary/[0.06]' : '',
          )}
        >
          <span className="w-5 shrink-0 text-muted-foreground">{i + 1}</span>
          <span className="min-w-0 flex-1 truncate text-foreground">
            {label(f.type)}.{f.name}
          </span>
          <span className="shrink-0 text-muted-foreground">{f.engines.join('+')}</span>
          <span className="w-14 shrink-0 text-right text-foreground">{f.score.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

export function RuntimeTrace({
  inspection,
  loading,
}: {
  inspection: AskResult | null;
  loading: boolean;
}) {
  if (!inspection) {
    return (
      <div className="flex h-full flex-col justify-center px-5 py-8 text-sm text-muted">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Execution trace</p>
        <p className="mt-3 max-w-xs leading-relaxed">
          Every step the runtime actually executes — Metadata Lookup, BM25, Vector Search, Graph
          Expansion, RRF Fusion, ConversationIR, Prompt Rendering, and the LLM call — with real
          scores and real data. This is not the LLM&apos;s internal reasoning; providers don&apos;t
          expose that, and CareerOS doesn&apos;t simulate it.
        </p>
      </div>
    );
  }

  const retrievalDone = inspection.retrieveMs !== undefined;
  const irDone = inspection.confidence !== undefined;
  const promptDone = inspection.promptRendered !== undefined;
  const llmStarted = inspection.provider !== undefined;
  const answerDone = inspection.answer !== undefined;

  const selectedCount = inspection.fusion.filter((f) => f.selected).length;

  return (
    <div className="h-full overflow-y-auto py-3">
      <Stage
        index={1}
        title="Hybrid Retrieval"
        pending={!retrievalDone}
        meta={retrievalDone ? `${inspection.retrieveMs} ms` : undefined}
      >
        <div className="space-y-2">
          <Box title="Metadata Lookup" meta={`${inspection.metadata.length} matches`}>
            <MatchList matches={inspection.metadata} showMatch />
          </Box>
          <Box title="BM25" meta={`${inspection.bm25.length} matches`}>
            <MatchList matches={inspection.bm25} />
          </Box>
          <Box
            title="Vector Search"
            meta={inspection.usedVector ? `${inspection.vector.length} matches` : 'off'}
          >
            <MatchList matches={inspection.vector} />
          </Box>
          <Box title="Graph Expansion (PPR)" meta={`${inspection.graphMatches.length} matches`}>
            <MatchList matches={inspection.graphMatches} />
          </Box>
          <Box title="RRF Fusion" meta={`${selectedCount} selected`} defaultOpen>
            <FusionTable fusion={inspection.fusion} />
          </Box>
        </div>
      </Stage>

      <Stage
        index={2}
        title="Graph Traversal"
        pending={!retrievalDone}
        meta={
          retrievalDone
            ? `${inspection.selectedNodes.length} nodes · ${inspection.edges.length} edges`
            : undefined
        }
      >
        <GraphTraversal nodes={inspection.selectedNodes} edges={inspection.edges} />
      </Stage>

      <Stage index={3} title="ConversationIR" pending={!irDone}>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono text-[11px]">
          <div className="col-span-2">
            <dt className="text-muted-foreground">intent (heuristic)</dt>
            <dd className="mt-0.5 text-foreground">{inspection.intent}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">confidence</dt>
            <dd className="mt-0.5 text-foreground">{inspection.confidence?.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">budget</dt>
            <dd className="mt-0.5 text-foreground">{inspection.tokenBudgetHint} chars</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">nodes</dt>
            <dd className="mt-0.5 text-foreground">{inspection.selectedNodes.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">edges</dt>
            <dd className="mt-0.5 text-foreground">{inspection.edges.length}</dd>
          </div>
        </dl>
        {inspection.knowledgeTrace ? (
          <Box
            title="Knowledge Used"
            meta={
              inspection.isContinuation
                ? `↳ context carried · ${inspection.knowledgeTrace.directMatches.length} direct · ${inspection.knowledgeTrace.supportingContext.length} supporting`
                : `${inspection.knowledgeTrace.directMatches.length} direct · ${inspection.knowledgeTrace.supportingContext.length} supporting`
            }
            defaultOpen
          >
            <KnowledgeTracePanel trace={inspection.knowledgeTrace} />
          </Box>
        ) : null}
        <Box title="Raw IR (JSON)">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-muted">
            {JSON.stringify(inspection.irRaw, null, 2)}
          </pre>
        </Box>
      </Stage>

      <Stage index={4} title="Prompt Renderer" pending={!promptDone}>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
          <div>
            <dt className="text-muted-foreground">characters</dt>
            <dd className="mt-0.5 text-foreground">{inspection.promptChars}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">est. tokens</dt>
            <dd className="mt-0.5 text-foreground">{inspection.promptEstTokens}</dd>
          </div>
        </dl>
        <Box title="System Prompt">
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-muted">
            {inspection.promptSystem}
          </pre>
        </Box>
        <Box title="Evidence Package (ConversationIR → Markdown)">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-muted">
            {inspection.promptRendered}
          </pre>
        </Box>
        <Box title="Full Rendered User Prompt">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-muted">
            {inspection.promptUser}
          </pre>
        </Box>
      </Stage>

      <Stage
        index={5}
        title="LLM Call"
        pending={!llmStarted}
        meta={inspection.llmMs !== undefined ? `${inspection.llmMs} ms` : llmStarted ? 'generating…' : undefined}
      >
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono text-[11px]">
          <div>
            <dt className="text-muted-foreground">provider</dt>
            <dd className="mt-0.5 text-foreground">{inspection.provider}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">model</dt>
            <dd className="mt-0.5 text-foreground">{inspection.model}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">temperature</dt>
            <dd className="mt-0.5 text-foreground">{inspection.temperature}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">thinking</dt>
            <dd className="mt-0.5 text-foreground">{inspection.thinking}</dd>
          </div>
          {inspection.inputTokens !== undefined ? (
            <div>
              <dt className="text-muted-foreground">input tokens</dt>
              <dd className="mt-0.5 text-foreground">{inspection.inputTokens}</dd>
            </div>
          ) : null}
          {inspection.outputTokens !== undefined ? (
            <div>
              <dt className="text-muted-foreground">output tokens</dt>
              <dd className="mt-0.5 text-foreground">{inspection.outputTokens}</dd>
            </div>
          ) : null}
        </dl>
      </Stage>

      <Stage index={6} title="Answer" pending={!answerDone} isLast>
        <p className="font-mono text-[10px] text-muted-foreground">
          Verbalized from the IR above · citation-only, no invented facts · total {inspection.totalMs} ms
        </p>
      </Stage>

      {!loading && !answerDone && inspection.selectedNodes.length === 0 && inspection.retrieveMs !== undefined ? (
        <p className="px-5 font-mono text-[11px] text-red-400">Something went wrong — check the chat panel.</p>
      ) : null}
    </div>
  );
}
