import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { Architecture } from '@/components/marketing/Architecture';
import { Pipeline } from '@/components/marketing/Pipeline';
import { Container } from '@/components/ui';
import { loadGraphStats } from '@/lib/loadGenerated';

export default function AboutPage() {
  const stats = loadGraphStats();

  return (
    <MarketingShell>
      <main>
        <Container className="py-16 md:py-20">
          <Link href="/" className="text-sm text-muted transition hover:text-foreground">
            ← CareerOS
          </Link>

          <header className="mt-8 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">About</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              About CareerOS
            </h1>
            <p className="mt-3 text-sm text-muted md:text-base">
              CareerOS is a personal knowledge compiler. Markdown is source. The graph is IR.
              Resume, Portfolio, and Interview AI are projections — not separate content stores.
            </p>
          </header>
        </Container>

        <Pipeline stats={stats} />
        <Architecture />

        <Container className="pb-20">
          <p className="text-sm text-muted">
            Read the architecture docs in the repo:{' '}
            <code className="font-mono text-xs text-primary">docs/02-architecture/</code>
          </p>
        </Container>
      </main>
    </MarketingShell>
  );
}
