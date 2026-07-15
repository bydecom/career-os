import { XCircle, CheckCircle2 } from 'lucide-react';

const TRADITIONAL = [
  'Resume maintained separately',
  'Portfolio maintained separately',
  'LinkedIn rewritten by hand',
  'AI prompts rebuilt from scratch',
];

const CAREEROS = [
  'One verified knowledge source',
  'Resume stays in sync',
  'Portfolio stays consistent',
  'AI answers from evidence',
];

function TraditionalVisual() {
  const silos = ['Resume', 'Portfolio', 'LinkedIn', 'AI prompts'];
  return (
    <div className="mt-6 rounded-md border border-border/80 bg-zinc-950/60 p-4" aria-hidden>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {silos.map((label) => (
          <div
            key={label}
            className="rounded border border-zinc-700/80 bg-zinc-900/80 px-2 py-3 text-center font-mono text-[10px] text-muted"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col items-center gap-1 text-zinc-600">
        <span className="text-[10px]">↓</span>
        <span className="font-mono text-[10px] text-red-400/70">Same facts · four copies · drift</span>
      </div>
    </div>
  );
}

function CareerOsVisual() {
  return (
    <div className="mt-6 rounded-md border border-primary/25 bg-zinc-950/40 p-4" aria-hidden>
      <div className="flex flex-col items-center font-mono text-[10px] text-muted">
        <span className="rounded border border-border px-2.5 py-1">Markdown</span>
        <span className="my-1 text-zinc-600">↓</span>
        <span className="rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
          Knowledge Graph
        </span>
        <svg className="my-1 h-7 w-full max-w-[220px] text-zinc-600" viewBox="0 0 220 28" fill="none">
          <path
            d="M110 0 V8 M110 8 H30 V24 M110 8 H110 V24 M110 8 H190 V24"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <div className="grid w-full grid-cols-3 gap-2">
          {['Resume', 'Portfolio', 'Interview'].map((label) => (
            <span
              key={label}
              className="rounded border border-white/10 bg-white/[0.04] px-1 py-2 text-center text-[10px] text-foreground/80"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-primary/80">
        One source · synchronized views
      </p>
    </div>
  );
}

export function WhatItSolves() {
  return (
    <section className="border-y border-border bg-zinc-950/40 px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-container">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
          The problem
        </p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What CareerOS solves</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          Most portfolios keep the same facts in four places — resume, project pages, LinkedIn, AI
          prompts.
          <br className="hidden sm:block" />
          CareerOS keeps one verified knowledge graph and compiles every view from that source.
        </p>

        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-2">
          <div className="flex h-full flex-col rounded-lg border border-border bg-card/30 p-6 backdrop-blur">
            <h3 className="text-sm font-medium text-muted">Traditional workflow</h3>
            <TraditionalVisual />
            <ul className="mt-5 space-y-3">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400/70" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <p className="border-t border-border pt-4 text-xs text-muted-foreground">
                Information drifts. Every surface becomes its own source of truth.
              </p>
            </div>
          </div>

          <div className="flex h-full flex-col rounded-lg border border-primary/30 bg-primary/5 p-6 backdrop-blur">
            <h3 className="text-sm font-medium text-primary">CareerOS</h3>
            <CareerOsVisual />
            <ul className="mt-5 space-y-3">
              {CAREEROS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <p className="border-t border-primary/20 pt-4 text-xs text-primary/80">
                Compile once. Project everywhere — without rewriting yourself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
