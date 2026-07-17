import type { ReactNode } from 'react';
import Link from 'next/link';
import type { ResumeIR } from '@career-os/resume';
import { Container } from '@/components/ui';
import { ResumeActions, ResumeBackLink } from './ResumeActions';
import {
  INTERESTS,
  RESUME_TAGLINE,
  SELECTED_DESIGNS,
  featuredCapabilities,
  groupSkillsByDomain,
  projectionHeadline,
  projectionSummary,
} from './resumeProjection';

function formatDateRange(start: string, end?: string) {
  const fmt = (d: string) => {
    const [y, m] = d.split('-');
    if (!y) return d;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const mi = m ? Number(m) - 1 : 0;
    return `${months[mi] ?? m} ${y}`;
  };
  return `${fmt(start)} — ${end ? fmt(end) : 'Present'}`;
}

function Section({
  title,
  children,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-8 print:break-inside-avoid print:py-6">
      {eyebrow ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-1 font-mono text-[11px] uppercase tracking-widest text-primary">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ResumeView({ ir }: { ir: ResumeIR }) {
  const { profile, experiences, education } = ir;
  const headline = projectionHeadline(ir);
  const summary = projectionSummary(ir);
  const capabilities = featuredCapabilities(ir);
  const skillDomains = groupSkillsByDomain(ir.skills);

  return (
    <Container className="max-w-3xl py-16 md:py-20 print:max-w-none print:px-0 print:py-0">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ResumeBackLink />
        <ResumeActions />
      </div>

      <header className="print:break-inside-avoid">
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary print:text-zinc-500">
          Projection · ResumeIR
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{profile.name}</h1>
        <p className="mt-3 text-lg font-medium text-primary print:text-zinc-800">{headline}</p>
        <p className="mt-2 max-w-xl text-sm text-muted md:text-base">{RESUME_TAGLINE}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {profile.location ? <span>{profile.location}</span> : null}
          {profile.email ? (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <a href={`mailto:${profile.email}`} className="hover:text-foreground">
                {profile.email}
              </a>
            </>
          ) : null}
          {profile.github ? (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </>
          ) : null}
          {profile.linkedin ? (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                LinkedIn
              </a>
            </>
          ) : null}
        </div>
      </header>

      <Section title="Summary" eyebrow="Capability">
        <p className="text-sm leading-relaxed text-foreground/90 md:text-base">{summary}</p>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Interested in
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <li
              key={item}
              className="rounded-md border border-border bg-card/30 px-2.5 py-1 text-xs text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Featured Capabilities" eyebrow="Projects as proof">
        <ul className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((c) => (
            <li key={c.id}>
              <Link
                href={c.href}
                className="group block h-full rounded-lg border border-border bg-card/30 p-4 transition hover:border-primary/40"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                  {c.capability}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary">
                  {c.name}
                </p>
                <p className="mt-1 text-xs text-muted">{c.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Selected Designs" eyebrow="Signature">
        <ul className="grid gap-3 sm:grid-cols-2">
          {SELECTED_DESIGNS.map((d) => (
            <li key={d.title}>
              <Link
                href={d.href}
                className="block rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3 transition hover:border-primary/40"
              >
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <p className="mt-1 text-xs text-muted">{d.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {experiences.length > 0 ? (
        <Section title="Experience" eyebrow="Brief">
          <ul className="space-y-6">
            {experiences.map((exp) => (
              <li key={exp.id} className="print:break-inside-avoid">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {exp.role}
                    <span className="font-normal text-muted"> — {exp.companyName}</span>
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </p>
                </div>
                {exp.summary ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted print:line-clamp-none">
                    {exp.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Skills" eyebrow="By domain">
        <div className="grid gap-6 sm:grid-cols-3">
          {skillDomains.map((bucket) => (
            <div key={bucket.domain}>
              <p className="text-sm font-semibold text-foreground">{bucket.domain}</p>
              <ul className="mt-3 space-y-1.5">
                {bucket.items.map((item) => (
                  <li key={item} className="text-xs text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {education.length > 0 ? (
        <Section title="Education">
          <ul className="space-y-2">
            {education.map((edu) => (
              <li key={edu.id} className="text-sm text-muted">
                <span className="font-medium text-foreground">{edu.name}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <footer className="mt-4 border-t border-border pt-6 print:hidden">
        <p className="font-mono text-[11px] text-muted-foreground">
          This page is a projection of{' '}
          <Link href="/resume/ir" className="text-primary hover:underline">
            ResumeIR
          </Link>
          . Source lives in Markdown — not edited as a document.
        </p>
      </footer>
    </Container>
  );
}
