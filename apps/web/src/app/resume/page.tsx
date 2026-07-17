import { MarketingShell } from '@/components/shell/MarketingShell';
import { ResumeView } from '@/components/resume/ResumeView';
import { loadResumeIR, generatedHint } from '@/lib/loadGenerated';

export default function ResumePage() {
  const ir = loadResumeIR();

  if (!ir) {
    return (
      <MarketingShell>
        <main className="mx-auto max-w-2xl px-6 py-20 md:px-10">
          <p className="text-xs uppercase tracking-widest text-primary">Resume</p>
          <h1 className="mt-3 text-3xl font-semibold">No ResumeIR yet</h1>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-border bg-card/40 p-4 font-mono text-xs text-muted">
            {`npm run compile\nnpm run resume`}
          </pre>
          <p className="mt-4 text-sm text-muted">Looking in: {generatedHint()}</p>
        </main>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <main>
        <ResumeView ir={ir} />
      </main>
    </MarketingShell>
  );
}
