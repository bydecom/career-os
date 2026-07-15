import Link from 'next/link';

export type FeaturedProject = {
  id: string;
  name: string;
  role?: string;
  period?: string;
  metric: string;
  blurb: string;
  stack: string[];
};

export function FeaturedProjects({ projects }: { projects: FeaturedProject[] }) {
  return (
    <section className="px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-container">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Proof</p>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Featured projects</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Evidence from the graph — not marketing fiction. Open a project for decisions,
              metrics, and related nodes.
            </p>
          </div>
          <Link href="/portfolio" className="text-sm text-primary hover:underline">
            View all portfolio →
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/project/${p.id}`}
              className="group flex min-h-[220px] flex-col justify-between overflow-hidden rounded-lg border border-border bg-card/50 p-6 backdrop-blur transition hover:border-primary/40"
            >
              <div>
                <div className="mb-8 h-24 rounded-md border border-border/60 bg-zinc-900" />
                <h3 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary">
                  {p.name}
                </h3>
                <p className="mt-2 text-xs text-muted">
                  {[p.role, p.period].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{p.blurb}</p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs text-primary">{p.metric}</p>
                <p className="text-xs text-muted-foreground">{p.stack.slice(0, 4).join(' · ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
