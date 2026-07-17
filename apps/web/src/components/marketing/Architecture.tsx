'use client';

import { motion } from 'framer-motion';
import { Container, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'source', label: 'Source', detail: 'Markdown nodes' },
  { id: 'compile', label: 'Compile', detail: 'Deterministic pipeline' },
  { id: 'knowledge', label: 'Knowledge', detail: 'Graph IR · single source' },
] as const;

const IRS = [
  { ir: 'ResumeIR', view: 'Resume' },
  { ir: 'PortfolioIR', view: 'Portfolio' },
  { ir: 'ConversationIR', view: 'Interview AI' },
] as const;

function ArrowDown({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center py-2', className)} aria-hidden>
      <motion.div
        className="h-6 w-px origin-top bg-gradient-to-b from-border to-primary/50 md:h-8"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      />
      <span className="mt-0.5 text-[10px] text-primary">▼</span>
    </div>
  );
}

function FanOut() {
  return (
    <div className="relative mx-auto mb-3 h-10 w-full max-w-lg" aria-hidden>
      <svg className="h-full w-full text-muted-foreground/50" viewBox="0 0 320 40" fill="none">
        <motion.path
          d="M160 0 V12 M160 12 H40 V36 M160 12 H160 V36 M160 12 H280 V36"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}

export function Architecture() {
  return (
    <section id="architecture" className="scroll-mt-24 border-y border-border bg-card/30 py-20 md:py-28">
      <Container>
        <SectionHeader
          eyebrow="Architecture"
          title="How it works"
          description="Implementation, not philosophy. Source compiles into a Knowledge Graph — then into typed IRs that power every surface."
          className="max-w-2xl"
        />

        <motion.div
          className="mx-auto mt-14 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Layer 1 — Source → Compile → Knowledge */}
          <div className="grid gap-3 sm:grid-cols-3">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={cn(
                  'relative rounded-lg border px-4 py-5 text-center',
                  stage.id === 'knowledge'
                    ? 'border-primary/50 bg-primary/[0.06] shadow-[0_0_40px_-16px_rgba(16,185,129,0.55)]'
                    : 'border-border bg-background/70',
                )}
              >
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3
                  className={cn(
                    'mt-2 text-sm font-semibold tracking-tight',
                    stage.id === 'knowledge' ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {stage.label}
                </h3>
                <p className="mt-1.5 text-xs text-muted">{stage.detail}</p>

                {/* Desktop connector between stages */}
                {i < STAGES.length - 1 ? (
                  <span
                    className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-muted-foreground/60 sm:block"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
              </motion.div>
            ))}
          </div>

          <ArrowDown />
          <FanOut />

          {/* Layer 2 — Typed IRs */}
          <div className="grid gap-3 sm:grid-cols-3">
            {IRS.map((item, i) => (
              <motion.div
                key={item.ir}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
                className="rounded-lg border border-border bg-background/60 px-3 py-4 text-center"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  IR
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">{item.ir}</p>
              </motion.div>
            ))}
          </div>

          <ArrowDown />

          {/* Layer 3 — Surfaces */}
          <div className="grid gap-3 sm:grid-cols-3">
            {IRS.map((item, i) => (
              <motion.div
                key={item.view}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
                className="rounded-lg border border-primary/25 bg-primary/[0.04] px-3 py-4 text-center backdrop-blur-sm transition hover:border-primary/45"
              >
                <p className="text-sm font-semibold text-foreground">{item.view}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">projection</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center font-mono text-[11px] text-muted-foreground">
            Source → Compile → Knowledge → Project
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
