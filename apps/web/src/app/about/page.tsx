import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { Architecture } from '@/components/marketing/Architecture';
import { Pipeline } from '@/components/marketing/Pipeline';
import { loadGraphStats } from '@/lib/loadGenerated';

export default function AboutPage() {
  const stats = loadGraphStats();

  return (
    <MarketingShell>
      <main>
        <div className="mx-auto max-w-container px-6 pt-16 md:px-10">
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← CareerOS
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">About CareerOS</h1>
          <p className="mt-4 max-w-2xl text-muted">
            CareerOS is a personal knowledge compiler. Markdown is source. The graph is IR. Resume,
            Portfolio, and Interview AI are projections — not separate content stores.
          </p>
        </div>
        <Pipeline stats={stats} />
        <Architecture />
        <div className="mx-auto max-w-container px-6 pb-20 md:px-10">
          <p className="text-sm text-muted">
            Read the architecture docs in the repo:{' '}
            <code className="font-mono text-xs text-primary">docs/02-architecture/</code>
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
