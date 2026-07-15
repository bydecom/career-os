import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { loadResumeIR } from '@/lib/loadGenerated';

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const ir = loadResumeIR();
  const project = ir?.projects.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <Link href="/portfolio" className="text-sm text-muted hover:text-foreground">
          ← Portfolio
        </Link>
        <p className="mt-8 text-xs uppercase tracking-widest text-primary">Project · from ResumeIR</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {[project.role, project.period].filter(Boolean).join(' · ')}
        </p>

        {project.summary ? (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Overview</h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{project.summary}</p>
          </section>
        ) : null}

        {project.keyDecisions.length > 0 ? (
          <section className="mt-8 border-t border-border pt-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Engineering decisions</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
              {project.keyDecisions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.metrics.length > 0 ? (
          <section className="mt-8 border-t border-border pt-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Metrics</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
              {project.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8 border-t border-border pt-8">
          <h2 className="text-xs uppercase tracking-widest text-muted">Evidence</h2>
          <p className="mt-4 text-sm text-muted">
            Full Evidence section (diagrams, ADRs, benchmarks) lands with PortfolioIR. This page
            currently projects from ResumeIR only.
          </p>
        </section>

        {project.technologies.length > 0 ? (
          <section className="mt-8 border-t border-border pt-8">
            <h2 className="text-xs uppercase tracking-widest text-muted">Tech stack</h2>
            <p className="mt-4 text-sm text-muted">{project.technologies.join(', ')}</p>
          </section>
        ) : null}
      </main>
    </MarketingShell>
  );
}
