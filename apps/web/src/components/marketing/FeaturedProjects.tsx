import Link from 'next/link';
import { Container, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

export type FeaturedMetric = {
  label: string;
  value: string;
};

export type FeaturedCta = {
  label: string;
  href: string;
};

/** Product Card — one capability per card (hire-first proof). */
export type FeaturedProduct = {
  id: string;
  name: string;
  capability: string;
  tagline: string;
  problem: string;
  outcome: string;
  architectureTeaser: string;
  metrics: FeaturedMetric[];
  primaryCta: FeaturedCta;
  secondaryCta: FeaturedCta;
  role?: string;
  period?: string;
};

/** @deprecated Prefer FeaturedProduct */
export type FeaturedProject = FeaturedProduct;

function CoverPreview({ id }: { id: string }) {
  const common = 'h-full w-full opacity-80';

  if (id === 'career-os') {
    return (
      <svg
        className={common}
        viewBox="0 0 400 120"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden
      >
        <rect x="28" y="42" width="64" height="36" rx="6" stroke="currentColor" className="text-border" />
        <text
          x="60"
          y="64"
          textAnchor="middle"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
        >
          MD
        </text>
        <path d="M92 60 H132" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1.5" />
        <path d="M126 56 L132 60 L126 64" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1.5" fill="none" />
        <rect x="132" y="36" width="100" height="48" rx="6" stroke="currentColor" className="text-primary/60" />
        <text
          x="182"
          y="64"
          textAnchor="middle"
          fill="currentColor"
          className="text-primary"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
        >
          Compiler
        </text>
        <path d="M232 60 H276" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1.5" />
        <path d="M270 56 L276 60 L270 64" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1.5" fill="none" />
        <circle cx="308" cy="60" r="24" stroke="currentColor" className="text-primary" strokeWidth="1.5" />
        <circle cx="298" cy="52" r="3.5" className="fill-primary" />
        <circle cx="318" cy="54" r="3.5" className="fill-primary" />
        <circle cx="308" cy="72" r="3.5" className="fill-primary" />
        <path
          d="M298 52 L318 54 M318 54 L308 72 M308 72 L298 52"
          stroke="currentColor"
          className="text-primary/50"
          strokeWidth="1"
        />
        <text
          x="308"
          y="102"
          textAnchor="middle"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          fontFamily="ui-monospace, monospace"
        >
          Knowledge Graph
        </text>
      </svg>
    );
  }

  if (id === 'graphrag-code') {
    return (
      <svg
        className={common}
        viewBox="0 0 400 120"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden
      >
        <circle cx="80" cy="60" r="8" className="fill-primary" />
        <circle cx="160" cy="32" r="6" className="fill-primary/70" />
        <circle cx="160" cy="88" r="6" className="fill-primary/70" />
        <circle cx="240" cy="44" r="6" className="fill-primary/50" />
        <circle cx="240" cy="80" r="6" className="fill-primary/50" />
        <circle cx="320" cy="60" r="8" className="fill-primary" />
        <path
          d="M88 60 H152 M88 60 L154 36 M88 60 L154 84 M166 32 H234 M166 88 H234 M246 44 H312 M246 80 H312"
          stroke="currentColor"
          className="text-primary/40"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (id === 'medical-citation-agent') {
    return (
      <svg
        className={common}
        viewBox="0 0 400 120"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden
      >
        <rect x="36" y="24" width="140" height="72" rx="6" stroke="currentColor" className="text-border" />
        <path
          d="M52 42 H160 M52 56 H136 M52 70 H148"
          stroke="currentColor"
          className="text-muted-foreground/40"
          strokeWidth="2"
        />
        <rect
          x="52"
          y="64"
          width="72"
          height="14"
          rx="2"
          className="fill-primary/25 stroke-primary"
          strokeWidth="1"
        />
        <path d="M176 60 H216" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1.5" />
        <rect x="216" y="30" width="148" height="60" rx="6" stroke="currentColor" className="text-primary/50" />
        <text
          x="290"
          y="56"
          textAnchor="middle"
          fill="currentColor"
          className="text-primary"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
        >
          claim + cite
        </text>
        <text
          x="290"
          y="74"
          textAnchor="middle"
          fill="currentColor"
          className="text-muted-foreground"
          fontSize="8"
          fontFamily="ui-monospace, monospace"
        >
          lines 42–44
        </text>
      </svg>
    );
  }

  // conversational-state-machine
  return (
    <svg
      className={common}
      viewBox="0 0 400 120"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <rect x="48" y="62" width="72" height="34" rx="6" stroke="currentColor" className="text-border" />
      <rect x="88" y="42" width="72" height="34" rx="6" stroke="currentColor" className="text-primary/40" />
      <rect x="128" y="22" width="72" height="34" rx="6" stroke="currentColor" className="text-primary" />
      <text
        x="164"
        y="42"
        textAnchor="middle"
        fill="currentColor"
        className="text-primary"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        hold
      </text>
      <path d="M210 40 H268" stroke="currentColor" className="text-muted-foreground/40" strokeWidth="1.5" />
      <rect x="268" y="24" width="84" height="32" rx="6" stroke="currentColor" className="text-primary/50" />
      <text
        x="310"
        y="44"
        textAnchor="middle"
        fill="currentColor"
        className="text-foreground"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
      >
        resume
      </text>
    </svg>
  );
}

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function CtaLink({
  cta,
  variant,
}: {
  cta: FeaturedCta;
  variant: 'primary' | 'secondary';
}) {
  const className = cn(
    'inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition',
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
      : 'border border-border text-muted hover:border-primary/40 hover:text-foreground',
  );

  if (isExternal(cta.href)) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
        {cta.label}
      </a>
    );
  }

  if (cta.href.startsWith('#')) {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    );
  }

  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}

function ProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-card/40 backdrop-blur',
        'transition duration-300 hover:border-primary/40',
        'hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.28)]',
      )}
    >
      {/* Stripe-style: Capability → Tagline → Architecture sketch → copy → metrics → CTA */}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div>
          <span className="inline-block rounded border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
            {product.capability}
          </span>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{product.name}</h3>
          <p className="mt-1 text-sm font-medium text-primary">{product.tagline}</p>
          {(product.role || product.period) && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {[product.role, product.period].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="mt-5 overflow-hidden rounded-md border border-border bg-background/80 text-foreground">
          <div className="flex h-28 items-center justify-center px-2 pt-2">
            <CoverPreview id={product.id} />
          </div>
          <p className="truncate border-t border-border/80 px-3 py-2 font-mono text-[10px] text-primary/90">
            {product.architectureTeaser}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Problem
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{product.problem}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Outcome
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{product.outcome}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-4">
          {product.metrics.map((m) => (
            <div key={m.label} className="text-center">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <CtaLink cta={product.primaryCta} variant="primary" />
          <CtaLink cta={product.secondaryCta} variant="secondary" />
        </div>
      </div>
    </article>
  );
}

export function FeaturedProjects({
  projects,
  mode = 'section',
}: {
  projects: FeaturedProduct[];
  /** `section` = Landing chrome; `embedded` = Portfolio (no outer header) */
  mode?: 'section' | 'embedded';
}) {
  const grid = (
    <div className="grid gap-5 md:grid-cols-2 md:gap-6">
      {projects.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  if (mode === 'embedded') {
    return <div className="mt-10">{grid}</div>;
  }

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Proof"
            title="Featured products"
            description="Four capabilities. Same standard: problem → architecture → measurable outcome. Open a project for decisions and trade-offs."
            className="max-w-2xl"
          />
          <Link
            href="/portfolio"
            className="shrink-0 text-sm text-primary transition hover:underline"
          >
            View all portfolio →
          </Link>
        </div>

        <div className="mt-14">{grid}</div>
      </Container>
    </section>
  );
}
