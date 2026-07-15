import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { FeaturedProjects } from '@/components/marketing/FeaturedProjects';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';
import { loadResumeIR } from '@/lib/loadGenerated';

export default function PortfolioPage() {
  const projects = pickFeaturedProjects(loadResumeIR());

  return (
    <MarketingShell>
      <main className="mx-auto max-w-container px-6 py-16 md:px-10">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← CareerOS
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Featured projections from the Knowledge Graph. Full PortfolioIR + filters come next.
        </p>
        <div className="mt-4">
          <FeaturedProjects projects={projects} />
        </div>
      </main>
    </MarketingShell>
  );
}
