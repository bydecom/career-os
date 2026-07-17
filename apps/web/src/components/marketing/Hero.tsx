'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function HeroPipelineVisual({ graphLabel }: { graphLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md rounded-lg border border-border bg-[#0c0c0e]/90 p-5 shadow-[0_0_60px_-20px_rgba(16,185,129,0.35)] backdrop-blur"
      aria-hidden
    >
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">career compile</span>
      </div>

      <div className="flex flex-col items-center font-mono text-[11px]">
        <span className="rounded border border-border px-3 py-1.5 text-muted">Markdown</span>
        <span className="my-1.5 text-zinc-600">│</span>
        <span className="text-zinc-600">▼</span>
        <span className="mt-1 rounded border border-primary/30 bg-primary/5 px-3 py-1.5 text-primary/90">
          Compiler
        </span>
        <span className="my-1.5 text-zinc-600">│</span>
        <span className="text-zinc-600">▼</span>

        <div className="relative mt-1 w-full rounded-md border border-primary/50 bg-gradient-to-b from-primary/15 to-transparent px-3 py-3 text-center shadow-[0_0_32px_-8px_rgba(16,185,129,0.7)]">
          <p className="text-xs font-medium text-foreground">Knowledge Graph</p>
          <p className="mt-1 text-[10px] text-emerald-400/90">{graphLabel}</p>
          <div className="mx-auto mt-3 flex h-8 max-w-[140px] items-center justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>

        <svg className="my-1 h-8 w-full text-zinc-600" viewBox="0 0 240 32" fill="none">
          <path
            d="M120 0 V10 M120 10 H40 V28 M120 10 H120 V28 M120 10 H200 V28"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>

        <div className="grid w-full grid-cols-3 gap-2">
          {['Resume', 'Portfolio', 'Interview'].map((label) => (
            <span
              key={label}
              className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-2 text-center text-[10px] text-muted"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-1 border-t border-border pt-3 font-mono text-[10px] text-muted-foreground">
        <p>
          <span className="text-primary">✓</span> graph.json
        </p>
        <p>
          <span className="text-primary">✓</span> resume.ir.json
        </p>
        <p>
          <span className="text-primary">✓</span> ConversationIR
        </p>
      </div>
    </motion.div>
  );
}

export function Hero({
  stats,
}: {
  stats?: { totalNodes: number; totalEdges: number } | null;
}) {
  const nodes = stats?.totalNodes ?? '—';
  const edges = stats?.totalEdges ?? '—';
  const graphLabel = `${nodes} nodes · ${edges} edges`;

  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%)]" />
      <div className="relative mx-auto grid max-w-container items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Compile once · Project everywhere
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-[1.05]">
            Compile knowledge.
            <br />
            <span className="text-muted">Not documents.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Markdown becomes a verified Knowledge Graph.
            <br className="hidden sm:block" />
            Resume, Portfolio, and Interview AI are only projections.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            >
              Explore Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center rounded-md border border-border bg-card/40 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition hover:border-primary/40"
            >
              Open Resume
            </Link>
            <span
              className="inline-flex flex-col items-start rounded-md px-4 py-2 text-sm text-muted-foreground"
              title="Ships in Phase 3"
            >
              <span className="font-medium text-muted">Try Interview AI</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Coming Phase 3
              </span>
            </span>
          </div>

          <p className="mt-8 font-mono text-[11px] tracking-wide text-muted-foreground">
            <span className="text-foreground/80">{nodes}</span> Nodes
            <span className="mx-2 text-zinc-700">·</span>
            <span className="text-foreground/80">{edges}</span> Edges
            <span className="mx-2 text-zinc-700">·</span>
            ResumeIR
            <span className="mx-2 text-zinc-700">·</span>
            ConversationIR
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPipelineVisual graphLabel={graphLabel} />
        </div>
      </div>
    </section>
  );
}
