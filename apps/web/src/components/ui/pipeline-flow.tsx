import { cn } from '@/lib/utils';

interface PipelineFlowProps {
  steps: readonly string[];
  className?: string;
}

/**
 * Compact vertical compile flow — reused by Hero / Pipeline / Principles / Architecture.
 * Tokens only; no hardcoded zinc/hex.
 */
export function PipelineFlow({ steps, className }: PipelineFlowProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start font-mono text-[10px] text-muted-foreground',
        className,
      )}
      aria-hidden
    >
      {steps.map((step, i) => (
        <div key={`${step}-${i}`} className="flex flex-col items-start">
          <span className="rounded border border-border bg-background/60 px-2 py-1 text-muted">
            {step}
          </span>
          {i < steps.length - 1 ? (
            <span className="my-1.5 ml-3 text-muted-foreground/40">↓</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
