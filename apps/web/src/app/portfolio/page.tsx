import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { FeaturedProjects } from '@/components/marketing/FeaturedProjects';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';
import { Container } from '@/components/ui';
import { loadResumeIR, loadGraphStats } from '@/lib/loadGenerated';

export default function PortfolioPage() {
  const ir = loadResumeIR();
  const featured = pickFeaturedProjects(ir, loadGraphStats());
  const featuredIds = new Set(featured.map((p) => p.id));
  const allProjects = ir?.projects ?? [];
  const rest = allProjects.filter((p) => !featuredIds.has(p.id));

  return (
    <MarketingShell>
      <main>
        <Container className="py-16 md:py-20">
          <Link href="/" className="text-sm text-muted transition hover:text-foreground">
            ← CareerOS
          </Link>

          <header className="mt-8 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Portfolio</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Proof from the graph
            </h1>
            <p className="mt-3 text-sm text-muted md:text-base">
              Featured products first — each card is a capability. Everything else is the full
              project index projected from ResumeIR. Search, filters, and timeline scale later.
            </p>
          </header>

          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Featured
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">Capabilities</h2>
              </div>
            </div>
            <FeaturedProjects projects={featured} mode="embedded" />
          </section>

          <section className="mt-20 border-t border-border pt-14">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              All projects
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">From ResumeIR</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Index view — open a project for problem, architecture, decisions, and evidence.
            </p>

            {allProjects.length === 0 ? (
              <p className="mt-8 text-sm text-muted">
                Run <code className="text-foreground">career compile && career resume</code> to
                hydrate the portfolio index.
              </p>
            ) : (
              <ul className="mt-8 divide-y divide-border border-y border-border">
                {allProjects.map((p) => {
                  const isFeatured = featuredIds.has(p.id);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/project/${p.id}`}
                        className="group flex flex-col gap-1 py-4 transition hover:bg-card/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-2"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-foreground group-hover:text-primary">
                              {p.name}
                            </span>
                            {isFeatured ? (
                              <span className="rounded border border-primary/30 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                                featured
                              </span>
                            ) : null}
                          </div>
                          {p.summary ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted">{p.summary}</p>
                          ) : null}
                        </div>
                        <p className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {[p.role, p.period].filter(Boolean).join(' · ') || 'Open →'}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {rest.length === 0 && allProjects.length > 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                All ResumeIR projects are currently in the Featured set.
              </p>
            ) : null}
          </section>
        </Container>
      </main>
    </MarketingShell>
  );
}
