import { Container, SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Rule {
  number: string;
  title: string;
  subtitle: string;
  description: string[];
  invariant: string;
}

const RULES: Rule[] = [
  {
    number: '01',
    title: 'Single Source of Truth',
    subtitle: 'One source. Infinite views.',
    description: [
      'Knowledge authored once.',
      'Resume · Portfolio · Interview are projections.',
    ],
    invariant: 'Author once. Compile forever.',
  },
  {
    number: '02',
    title: "Compile. Don't Copy.",
    subtitle: 'Author once.',
    description: [
      "Resume isn't edited.",
      "Portfolio isn't rewritten.",
      'Both are compiled.',
    ],
    invariant: 'Markdown → Resume · Portfolio · Interview',
  },
  {
    number: '03',
    title: 'Evidence over Prompt',
    subtitle: 'Evidence first.',
    description: ['The LLM never invents.', 'It verbalizes verified IR.'],
    invariant: 'IR is truth. LLM is voice.',
  },
];

function RuleCard({ rule }: { rule: Rule }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card/40 p-8 backdrop-blur',
        'transition-all duration-300',
        'hover:border-[color:var(--primary)] hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.35)]',
      )}
    >
      {/* Top emerald edge — appear on hover (hex CSS vars break Tailwind /opacity) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 origin-center scale-x-75 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100"
        aria-hidden
      />

      <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
        RULE {rule.number}
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
            {rule.title}
          </h3>
          <p className="mt-2 text-sm font-medium text-primary">{rule.subtitle}</p>
        </div>

        <div className="h-px bg-gradient-to-r from-border via-border to-transparent" />

        <div className="space-y-1">
          {rule.description.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-muted">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8">
        <div className="space-y-2 border-t border-border pt-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Invariant
          </p>
          <p className="text-sm font-medium text-foreground">{rule.invariant}</p>
        </div>
      </div>
    </article>
  );
}

export function Philosophy() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeader
          eyebrow="Core Principles"
          title="How CareerOS is built"
          description="Three rules. Everything else is implementation detail."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {RULES.map((rule) => (
            <RuleCard key={rule.number} rule={rule} />
          ))}
        </div>
      </Container>
    </section>
  );
}
