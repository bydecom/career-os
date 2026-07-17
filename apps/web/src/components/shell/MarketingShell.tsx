import Link from 'next/link';
import type { ReactNode } from 'react';

const nav = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/resume', label: 'Resume' },
  { href: '/interview', label: 'Interview' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function MarketingShell({
  children,
  hideFooter = false,
  lockViewport = false,
}: {
  children: ReactNode;
  /** Interview IDE — no marketing footer */
  hideFooter?: boolean;
  /** Fill exactly 100vh; children scroll inside panes */
  lockViewport?: boolean;
}) {
  return (
    <div
      className={
        lockViewport
          ? 'flex h-dvh flex-col overflow-hidden bg-background text-foreground'
          : 'min-h-screen bg-background text-foreground'
      }
    >
      <header className="sticky top-0 z-40 shrink-0 border-b border-border/80 bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-12 max-w-container items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground md:text-[17px]"
          >
            CareerOS
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <a
            href="https://github.com/bydecom"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </header>
      <div className={lockViewport ? 'min-h-0 flex-1 overflow-hidden' : undefined}>{children}</div>
      {!hideFooter ? (
        <footer className="border-t border-border print:hidden">
          <div className="mx-auto flex max-w-container flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
            <p className="text-sm text-muted">CareerOS · Compile knowledge. Not documents.</p>
            <div className="flex flex-wrap gap-5 text-sm text-muted">
              <a
                className="hover:text-foreground"
                href="https://github.com/bydecom"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                className="hover:text-foreground"
                href="https://www.linkedin.com/in/minh-bang-thai-742013378/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a className="hover:text-foreground" href="mailto:thaibang4903@gmail.com">
                Email
              </a>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
