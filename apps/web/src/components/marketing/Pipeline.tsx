'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, Network } from 'lucide-react';

type StageId = 'markdown' | 'compiler' | 'graph';

const PIPELINE: {
  id: StageId;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  details: string[];
  variant: 'flat' | 'engine' | 'hero';
}[] = [
  {
    id: 'markdown',
    title: 'Markdown',
    subtitle: 'Write knowledge as source',
    icon: FileText,
    details: ['Atomic nodes', 'Frontmatter schema', 'Wiki-links → edges'],
    variant: 'flat',
  },
  {
    id: 'compiler',
    title: 'Compiler',
    subtitle: 'Deterministic pipeline',
    icon: Cpu,
    details: ['Lexer', 'Parser', 'Ontology validator', 'Graph builder'],
    variant: 'engine',
  },
  {
    id: 'graph',
    title: 'Knowledge Graph',
    subtitle: 'Intermediate Representation · single source of truth',
    icon: Network,
    details: ['48 nodes', '95 edges', 'graph.json + SQLite', 'Ontology-typed'],
    variant: 'hero',
  },
];

const PROJECTIONS = [
  { name: 'Resume', file: 'resume.ir.json', hint: 'Master projection' },
  { name: 'Portfolio', file: 'portfolio.ir.json', hint: 'Project views' },
  { name: 'Interview AI', file: 'ConversationIR', hint: 'Evidence-backed chat' },
];

function Connector() {
  return (
    <div className="flex flex-col items-center py-1" aria-hidden>
      <motion.div
        className="h-8 w-px origin-top bg-gradient-to-b from-zinc-600 to-zinc-800 md:h-10"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      />
      <motion.span
        className="text-[10px] text-primary"
        initial={{ opacity: 0, y: -4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.12 }}
      >
        ▼
      </motion.span>
    </div>
  );
}

function FanOutConnectors() {
  return (
    <div className="relative mb-3 mt-1 h-10 w-full max-w-xl" aria-hidden>
      <svg className="h-full w-full text-zinc-600" viewBox="0 0 320 40" fill="none">
        <motion.path
          d="M160 0 V12 M160 12 H40 V36 M160 12 H160 V36 M160 12 H280 V36"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}

function GraphConstellation() {
  const nodes = [
    { x: '12%', y: '30%', delay: 0 },
    { x: '38%', y: '18%', delay: 0.15 },
    { x: '58%', y: '42%', delay: 0.3 },
    { x: '78%', y: '22%', delay: 0.45 },
    { x: '48%', y: '68%', delay: 0.2 },
    { x: '22%', y: '62%', delay: 0.35 },
  ];

  return (
    <div className="relative mt-4 h-16 w-full overflow-hidden rounded-md border border-primary/20 bg-zinc-950/60">
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <line x1="14%" y1="34%" x2="40%" y2="22%" stroke="rgb(16 185 129)" strokeWidth="1" />
        <line x1="40%" y1="22%" x2="60%" y2="44%" stroke="rgb(16 185 129)" strokeWidth="1" />
        <line x1="60%" y1="44%" x2="80%" y2="26%" stroke="rgb(16 185 129)" strokeWidth="1" />
        <line x1="40%" y1="22%" x2="50%" y2="70%" stroke="rgb(16 185 129)" strokeWidth="1" />
        <line x1="24%" y1="64%" x2="50%" y2="70%" stroke="rgb(16 185 129)" strokeWidth="1" />
        <line x1="14%" y1="34%" x2="24%" y2="64%" stroke="rgb(16 185 129)" strokeWidth="1" />
      </svg>
      {nodes.map((n) => (
        <motion.span
          key={`${n.x}-${n.y}`}
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]"
          style={{ left: n.x, top: n.y }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: n.delay, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute bottom-2 right-3 font-mono text-[10px] text-emerald-400/90">
        48 nodes · 95 edges
      </div>
    </div>
  );
}

function stageClass(variant: (typeof PIPELINE)[number]['variant'], hovered: boolean) {
  const base =
    'group relative w-full max-w-lg rounded-lg border p-5 text-left transition duration-300';
  switch (variant) {
    case 'flat':
      return `${base} border-border bg-zinc-950/80 ${hovered ? 'border-zinc-500' : ''}`;
    case 'engine':
      return `${base} border-primary/35 bg-primary/[0.04] shadow-[0_0_24px_-14px_rgba(16,185,129,0.45)] ${
        hovered ? 'border-primary/55' : ''
      }`;
    case 'hero':
      return `${base} border-primary/60 bg-gradient-to-b from-primary/20 via-primary/5 to-zinc-950 shadow-[0_0_56px_-8px_rgba(16,185,129,0.75)] ${
        hovered ? 'border-primary shadow-[0_0_72px_-6px_rgba(16,185,129,0.9)]' : ''
      }`;
  }
}

export function Pipeline() {
  const [hovered, setHovered] = useState<StageId | 'proj' | null>(null);

  return (
    <section className="px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-container">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
          Signature · Pipeline
        </p>
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">
          Compile once. Project everywhere.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">
          Markdown becomes a Knowledge Graph IR — then fans out into Resume, Portfolio, and
          Interview AI. The graph is the product; the compiler is how you get there.
        </p>

        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-lg border border-border bg-[#0c0c0e]">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="ml-3 font-mono text-[11px] text-muted-foreground">
              career compile —verbose
            </span>
          </div>

          <div className="flex flex-col items-center px-4 py-8 md:px-10">
            {PIPELINE.map((stage, index) => {
              const Icon = stage.icon;
              const isHot = hovered === stage.id;
              return (
                <div key={stage.id} className="flex w-full flex-col items-center">
                  <motion.button
                    type="button"
                    onMouseEnter={() => setHovered(stage.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(stage.id)}
                    onBlur={() => setHovered(null)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: index * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={stageClass(stage.variant, isHot)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                          stage.variant === 'hero'
                            ? 'border-primary/60 bg-primary/20 text-primary'
                            : stage.variant === 'engine'
                              ? 'border-primary/35 bg-primary/10 text-primary'
                              : 'border-border bg-zinc-900 text-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3
                            className={`tracking-tight text-foreground ${
                              stage.variant === 'hero'
                                ? 'text-lg font-semibold'
                                : 'text-base font-semibold'
                            }`}
                          >
                            {stage.title}
                          </h3>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{stage.subtitle}</p>

                        {stage.variant === 'hero' ? <GraphConstellation /> : null}

                        <AnimatePresence initial={false}>
                          {isHot ? (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="mt-4 space-y-1.5 overflow-hidden border-t border-border/80 pt-3"
                            >
                              {stage.details.map((d) => (
                                <li
                                  key={d}
                                  className="flex items-center gap-2 font-mono text-xs text-primary/90"
                                >
                                  <span className="text-primary">✓</span>
                                  {d}
                                </li>
                              ))}
                            </motion.ul>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>

                  {index < PIPELINE.length - 1 ? <Connector /> : null}
                </div>
              );
            })}

            {/* Fan-out: Graph → projections */}
            <FanOutConnectors />

            <motion.div
              className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3"
              onMouseEnter={() => setHovered('proj')}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.45 }}
            >
              {PROJECTIONS.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 backdrop-blur-sm transition hover:border-primary/30 hover:bg-white/[0.05]"
                >
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{p.file}</p>
                  <p className="mt-2 text-[11px] text-muted">{p.hint}</p>
                </motion.div>
              ))}
            </motion.div>

            <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground">
              Compile once → project everywhere
            </p>
          </div>

          <div className="border-t border-border px-4 py-4 md:px-8">
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              <span className="text-primary">✓</span> Generated{' '}
              <span className="text-foreground/80">graph.json</span>
              {' · '}
              <span className="text-foreground/80">graph.db</span>
              {' · '}
              <span className="text-foreground/80">resume.ir.json</span>
              {' · '}
              <span className="text-foreground/80">diagnostics.json</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
