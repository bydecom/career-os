const STAGES = [
  { title: 'Source', items: ['Markdown nodes', 'Frontmatter + body', 'Wiki-links'] },
  { title: 'Compiler', items: ['Lexer / Parser', 'Ontology validate', 'Graph builder'] },
  { title: 'Knowledge IR', items: ['graph.json', 'graph.db', 'Embeddings (opt.)'] },
  { title: 'Runtime', items: ['Hybrid Retriever', 'ConversationIR', 'LLM verbalize'] },
  { title: 'Projections', items: ['ResumeIR', 'PortfolioIR', 'Views / MCP'] },
];

export function Architecture() {
  return (
    <section className="border-y border-border bg-zinc-950/40 px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-container">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Architecture</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Compiler depth</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">
          Not a chatbot wrapper. A knowledge compiler with deterministic retrieval before any
          language model speaks.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage, i) => (
            <div
              key={stage.title}
              className="relative rounded-lg border border-border bg-background/70 p-5"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{stage.title}</h3>
              <ul className="mt-4 space-y-2">
                {stage.items.map((item) => (
                  <li key={item} className="text-xs text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
