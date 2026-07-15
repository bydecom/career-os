import Link from 'next/link';
import { MarketingShell } from '@/components/shell/MarketingShell';
import { loadResumeIR } from '@/lib/loadGenerated';

export default function ContactPage() {
  const profile = loadResumeIR()?.profile;

  const rows = [
    { label: 'Email', value: profile?.email, href: profile?.email ? `mailto:${profile.email}` : undefined },
    { label: 'GitHub', value: profile?.github, href: profile?.github },
    { label: 'LinkedIn', value: profile?.linkedin, href: profile?.linkedin },
    { label: 'Website', value: profile?.website, href: profile?.website },
    { label: 'Location', value: profile?.location },
  ].filter((r) => r.value && r.value.trim());

  return (
    <MarketingShell>
      <main className="mx-auto max-w-xl px-6 py-16 md:px-10">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← CareerOS
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-3 text-sm text-muted">From the profile node in the Knowledge Graph.</p>
        <ul className="mt-10 space-y-4 border-t border-border pt-8">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <span className="text-xs uppercase tracking-widest text-muted">{row.label}</span>
              {row.href ? (
                <a
                  href={row.href}
                  target={row.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {row.value}
                </a>
              ) : (
                <span className="text-sm text-foreground">{row.value}</span>
              )}
            </li>
          ))}
        </ul>
      </main>
    </MarketingShell>
  );
}
