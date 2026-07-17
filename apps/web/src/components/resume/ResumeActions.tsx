'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const btn = {
  primary:
    'inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-hover',
  secondary:
    'inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-foreground',
};

export function ResumeActions() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className={btn.primary}>
        Download PDF
      </button>
      <Link href="/resume/markdown" className={btn.secondary}>
        Open Markdown
      </Link>
      <Link href="/resume/ir" className={btn.secondary}>
        View ResumeIR
      </Link>
    </div>
  );
}

export function ResumeBackLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('text-sm text-muted transition hover:text-foreground print:hidden', className)}
    >
      ← CareerOS
    </Link>
  );
}
