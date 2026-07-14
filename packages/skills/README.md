# `@career-os/skills` (scaffold)

**Status:** Planned — see [Platform Capability Map](../../docs/00-vision/10-platform-capability-map.md)

Domain interface for CareerOS. Skills are the product API; protocols (MCP, REST, CLI) are adapters.

```ts
interface Skill {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
}
```

Examples (not implemented yet):

- `search_nodes`
- `search_journal`
- `graph_neighbors`
- `explain_decision`
- `compile_resume`
- `compare_projects`

Do not implement MCP here. MCP will *register* these skills later.
