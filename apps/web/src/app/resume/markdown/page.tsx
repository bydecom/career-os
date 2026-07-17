import Link from 'next/link';
import { renderMarkdown } from '@career-os/resume';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { Container } from '@/components/ui';
import { loadResumeIR, generatedHint } from '@/lib/loadGenerated';

export default function ResumeMarkdownPage() {
  const ir = loadResumeIR();
  const md = ir ? renderMarkdown(ir) : null;

  return (
    <MarketingShell>
      <main>
        <Container className="max-w-3xl py-16 md:py-20">
          <Link href="/resume" className="text-sm text-muted transition hover:text-foreground">
            ← Resume
          </Link>
          <p className="mt-8 font-mono text-xs uppercase tracking-widest text-primary">
            Markdown projection
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Open Markdown</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Rendered from ResumeIR via <code className="text-foreground/80">renderMarkdown</code> —
            same IR as the HTML Resume, different surface.
          </p>

          {!md ? (
            <p className="mt-8 text-sm text-muted">
              Missing IR at {generatedHint()}. Run{' '}
              <code className="text-foreground">npm run compile && npm run resume</code>.
            </p>
          ) : (
            <pre className="mt-10 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-card/40 p-5 font-mono text-xs leading-relaxed text-muted">
              {md}
            </pre>
          )}
        </Container>
      </main>
    </MarketingShell>
  );
}
