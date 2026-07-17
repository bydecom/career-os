import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { Container } from '@/components/ui';
import { loadResumeIR, generatedHint } from '@/lib/loadGenerated';

export default function ResumeIrPage() {
  const ir = loadResumeIR();

  return (
    <MarketingShell>
      <main>
        <Container className="max-w-4xl py-16 md:py-20">
          <Link href="/resume" className="text-sm text-muted transition hover:text-foreground">
            ← Resume
          </Link>
          <p className="mt-8 font-mono text-xs uppercase tracking-widest text-primary">
            Intermediate Representation
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">ResumeIR</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            The HTML Resume is a projection of this artifact. Source of truth remains Markdown in{' '}
            <code className="text-foreground/80">career-data/</code>.
          </p>

          {!ir ? (
            <p className="mt-8 text-sm text-muted">
              Missing IR at {generatedHint()}. Run{' '}
              <code className="text-foreground">npm run compile && npm run resume</code>.
            </p>
          ) : (
            <pre className="mt-10 overflow-x-auto rounded-lg border border-border bg-card/40 p-4 font-mono text-[11px] leading-relaxed text-muted">
              {JSON.stringify(ir, null, 2)}
            </pre>
          )}
        </Container>
      </main>
    </MarketingShell>
  );
}
