const TECH = [
  'TypeScript',
  'Node.js',
  'Python',
  'Redis',
  'RabbitMQ',
  'Prisma',
  'PostgreSQL',
  'Qdrant',
  'Gemini',
  'Docker',
  'AWS',
  'Next.js',
];

export function TechCloud() {
  return (
    <section className="border-t border-border px-6 py-14 md:px-10">
      <div className="mx-auto max-w-container">
        <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Stack (from the graph)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {TECH.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
