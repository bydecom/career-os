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

const LINE = 'bg-zinc-500';

function ArrowDown({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center py-2', className)} aria-hidden>
      <div className={cn('h-6 w-px md:h-8', LINE)} />
      <span className="mt-0.5 text-[10px] leading-none text-primary">▼</span>
    </div>
  );
}

/**
 * Knowledge → fan-out → 3 IRs.
 * Same 3-col + gap-3 grid as the cards, so stems land on column centers.
 */
function KnowledgeFanOut() {
  return (
    <div className="relative h-16 w-full md:h-20" aria-hidden>
      {/* Horizontal bar: col1 center → col3 center */}
      <div
        className={cn('absolute top-[45%] h-px -translate-y-1/2', LINE)}
        style={{
          left: 'calc((100% - 1.5rem) / 6)',
          right: 'calc((100% - 1.5rem) / 6)',
        }}
      />

      <div className="grid h-full grid-cols-3 gap-3">
        {/* ResumeIR stem (from horizontal down) */}
        <div className="relative flex justify-center">
          <div className={cn('absolute top-[45%] bottom-0 w-px', LINE)} />
        </div>

        {/* PortfolioIR stem */}
        <div className="relative flex justify-center">
          <div className={cn('absolute top-[45%] bottom-0 w-px', LINE)} />
        </div>

        {/* Knowledge → ConversationIR (full stem + arrow) */}
        <div className="relative flex justify-center">
          <div className={cn('absolute inset-y-0 w-px', LINE)} />
          <span className="absolute top-[28%] text-[10px] leading-none text-primary">▼</span>
        </div>
      </div>
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

          <KnowledgeFanOut />

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
