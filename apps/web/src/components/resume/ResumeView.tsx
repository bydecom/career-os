import type { ReactNode } from 'react';
import Link from 'next/link';
import type { ResumeIR, ResumeProject } from '@career-os/resume';
import { Container } from '@/components/ui';
import { ResumeActions, ResumeBackLink } from './ResumeActions';
import { inlineMd } from './inlineMd';
import {
  PROJECT_GROUPS,
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
    <section className="border-t border-border py-8 print:break-inside-avoid print:py-5">
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

function ProjectBlock({ project }: { project: ResumeProject }) {
  return (
    <article className="print:break-inside-avoid">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="text-sm font-semibold text-foreground">
          <Link href={`/project/${project.id}`} className="hover:text-primary">
            {project.name}
          </Link>
          {project.role ? (
            <span className="font-normal text-muted"> — {project.role}</span>
          ) : null}
        </p>
        {project.period ? (
          <p className="shrink-0 font-mono text-[11px] text-muted-foreground">{project.period}</p>
        ) : null}
      </div>
      {project.summary ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{inlineMd(project.summary)}</p>
      ) : null}
      {project.keyDecisions.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
          {project.keyDecisions.map((b) => (
            <li key={b}>{inlineMd(b)}</li>
          ))}
        </ul>
      ) : null}
      {project.technologies.length > 0 ? (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          {project.technologies.join(' · ')}
        </p>
      ) : null}
    </article>
  );
}

export function ResumeView({ ir }: { ir: ResumeIR }) {
  const { profile, experiences, education, projects } = ir;
  const headline = projectionHeadline(ir);
  const summary = projectionSummary(ir);
  const byId = new Map(projects.map((p) => [p.id, p]));
  const groupedIds = new Set(PROJECT_GROUPS.flatMap((g) => g.ids));
  const leftover = projects.filter((p) => !groupedIds.has(p.id));

  return (
    <Container className="max-w-3xl py-16 md:py-20 print:max-w-none print:px-0 print:py-0">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <ResumeBackLink />
        <ResumeActions />
      </div>

      <header className="print:break-inside-avoid">
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary print:text-zinc-500">
          Projection · ResumeIR
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{profile.name}</h1>
        <p className="mt-3 text-lg font-medium text-primary print:text-zinc-800">{headline}</p>

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

      <Section title="Summary">
        <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
          {inlineMd(summary)}
        </p>
      </Section>

      {profile.specialties?.length ? (
        <Section title="Specialties">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            {profile.specialties.map((s) => (
              <li key={s}>{inlineMd(s)}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {experiences.length > 0 ? (
        <Section title="Experience" eyebrow="Employment">
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
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {inlineMd(exp.summary)}
                  </p>
                ) : null}
                {exp.highlights?.length ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                    {exp.highlights.map((h) => (
                      <li key={h}>{inlineMd(h)}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Projects" eyebrow="Working experience highlights">
        <div className="space-y-10">
          {PROJECT_GROUPS.map((group) => {
            const items = group.ids.map((id) => byId.get(id)).filter(Boolean) as ResumeProject[];
            if (items.length === 0) return null;
            return (
              <div key={group.title}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                  {group.title}
                </p>
                <div className="space-y-8">
                  {items.map((p) => (
                    <ProjectBlock key={p.id} project={p} />
                  ))}
                </div>
              </div>
            );
          })}
          {leftover.length > 0 ? (
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                Other
              </p>
              <div className="space-y-8">
                {leftover.map((p) => (
                  <ProjectBlock key={p.id} project={p} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {profile.stacks?.length ? (
        <Section title="Technical Stacks">
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
            {profile.stacks.map((s) => (
              <li key={s}>{inlineMd(s)}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section title="Education">
          <ul className="space-y-2">
            {education.map((edu) => (
              <li key={edu.id} className="text-sm text-muted">
                <span className="font-medium text-foreground">{edu.name}</span>
                {edu.summary ? <span> — {inlineMd(edu.summary)}</span> : null}
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
