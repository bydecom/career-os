import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Optional marketing section chrome. Prefer raw typography when spacing/layout diverge.
 */
export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('max-w-xl', className)}>
      {eyebrow ? (
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm text-muted md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
