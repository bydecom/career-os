import { readFileSync } from 'fs';
import type { KnowledgeGraph } from '@career-os/ontology';

// ---------------------------------------------------------------------------
// Loads the compiled Knowledge Graph IR (career-data/generated/graph.json)
// into memory. The compiler is the only writer of this file; the retriever
// is strictly read-only, per the API principle "Read-Only by Default"
// (docs/02-architecture/06-api-design.md).
// ---------------------------------------------------------------------------

export function loadGraph(graphJsonPath: string): KnowledgeGraph {
  const raw = readFileSync(graphJsonPath, 'utf-8');
  const parsed = JSON.parse(raw) as KnowledgeGraph;
  return parsed;
}
