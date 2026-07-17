import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ProjectMediaSlot } from '@/lib/projectAssets';
import type { ProjectDetailView as Detail } from './projectDetailData';
import { ProjectDemoMedia } from './ProjectDemoMedia';

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-10">
      <h2 className="font-mono text-[11px] uppercase tracking-widest text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function ProjectDetailView({
  detail,
  media = [],
}: {
  detail: Detail;
  media?: ProjectMediaSlot[];
}) {
  return (
    <Container className="max-w-3xl py-16 md:py-20">
      <Link href="/portfolio" className="text-sm text-muted transition hover:text-foreground">
        ← Portfolio
      </Link>

      {/* Hero */}
      <header className="mt-8">
        {detail.capability ? (
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary">
            {detail.capability}
          </p>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-widest text-primary">
            Project · ResumeIR projection
          </p>
        )}
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{detail.name}</h1>
        {detail.tagline ? (
          <p className="mt-3 text-lg font-medium text-primary">{detail.tagline}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          {[detail.role, detail.period].filter(Boolean).join(' · ')}
        </p>

        {detail.links.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {detail.links.map((link) => {
              const className = cn(
                'inline-flex items-center rounded-md px-3 py-2 text-xs font-medium transition',
                'border border-border text-muted hover:border-primary/40 hover:text-foreground',
              );
              return isExternal(link.href) ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={className}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </header>

      <div className="mt-14 space-y-2">
        <Section title="Overview">
          <p className="text-sm leading-relaxed text-foreground/90 md:text-base">{detail.overview}</p>
        </Section>

        {media.length > 0 ? (
          <Section id="demo" title="Demo">
            <ProjectDemoMedia projectId={detail.id} media={media} />
          </Section>
        ) : null}

        <Section title="Problem">
          <p className="text-sm leading-relaxed text-muted md:text-base">{detail.problem}</p>
          {detail.constraints.length > 0 ? (
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Constraints
              </p>
              <ul className="mt-3 space-y-2">
                {detail.constraints.map((c) => (
                  <li key={c} className="flex gap-2 text-sm text-muted">
                    <span className="text-primary">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>

        <Section title={detail.capabilities && detail.capabilities.length > 0 ? 'Runtime Pipeline' : 'Architecture'}>
          <p className="text-sm leading-relaxed text-foreground/90">{detail.architecture.summary}</p>
          {detail.architecture.steps.length > 0 ? (
            <ol
              className={
                detail.capabilities && detail.capabilities.length > 0
                  ? 'mt-6 space-y-2'
                  : 'mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'
              }
            >
              {detail.architecture.steps.map((step, i) =>
                detail.capabilities && detail.capabilities.length > 0 ? (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 font-mono text-[10px] text-primary">
                      {i + 1}
                    </span>
                    <span className="rounded-md border border-border bg-card/50 px-3 py-2 font-mono text-xs text-foreground">
                      {step}
                    </span>
                  </li>
                ) : (
                  <li key={step} className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-card/50 px-3 py-2 font-mono text-xs text-foreground">
                      {step}
                    </span>
                    {i < detail.architecture.steps.length - 1 ? (
                      <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                ),
              )}
            </ol>
          ) : null}
        </Section>

        {detail.capabilities && detail.capabilities.length > 0 ? (
          <Section title="Core Capabilities">
            <ul className="space-y-3">
              {detail.capabilities.map((cap) => (
                <li
                  key={cap.title}
                  className="rounded-lg border border-border bg-card/30 px-4 py-3"
                >
                  <p className="text-sm font-medium text-foreground">{cap.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{cap.description}</p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {detail.decisions.length > 0 ? (
          <Section title="Engineering decisions">
            <ul className="space-y-3">
              {detail.decisions.map((d) => (
                <li
                  key={d}
                  className="rounded-lg border border-border bg-card/30 px-4 py-3 text-sm leading-relaxed text-muted"
                >
                  {d}
                </li>
              ))}
            </ul>
            {detail.tradeoffs.length > 0 ? (
              <div className="mt-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tradeoffs
                </p>
                <ul className="mt-3 space-y-2">
                  {detail.tradeoffs.map((t) => (
                    <li key={t} className="flex gap-2 text-sm text-muted">
                      <span className="text-primary">↔</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>
        ) : null}

        {detail.timeline.length > 0 ? (
          <Section title="Timeline">
            <ul className="space-y-3 border-l border-border pl-4">
              {detail.timeline.map((t) => (
                <li key={t} className="relative text-sm text-muted">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {detail.technologies.length > 0 ? (
          <Section title="Tech stack">
            <div className="flex flex-wrap gap-2">
              {detail.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>
        ) : null}

        {detail.metrics.length > 0 ? (
          <Section title="Metrics">
            <dl className="grid gap-3 sm:grid-cols-2">
              {detail.metrics.map((m) => (
                <div
                  key={m}
                  className="rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3"
                >
                  <dd className="text-sm font-medium text-foreground">{m}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        {detail.evidence.length > 0 ? (
          <Section title="Evidence">
            <ul className="space-y-2">
              {detail.evidence.map((e) => (
                <li key={e} className="flex gap-2 text-sm text-muted">
                  <span className="text-primary">✓</span>
                  {isExternal(e) ? (
                    <a
                      href={e}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {e}
                    </a>
                  ) : (
                    <span>{e}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {detail.lessons.length > 0 ? (
          <Section title="Lessons">
            <ul className="space-y-3">
              {detail.lessons.map((l) => (
                <li key={l} className="text-sm leading-relaxed text-muted">
                  {l}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {detail.related.length > 0 ? (
          <Section title="Related nodes">
            <div className="flex flex-wrap gap-2">
              {detail.related.map((r) => (
                <span
                  key={r}
                  className="rounded-md border border-border/80 px-2.5 py-1 text-xs text-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          </Section>
        ) : null}

        {detail.sources.length > 0 ? (
          <Section title="Source documents">
            <ul className="space-y-2 font-mono text-xs text-muted-foreground">
              {detail.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </Container>
  );
}
