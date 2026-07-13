// ---------------------------------------------------------------------------
// SQLite schema for the compiled Knowledge Graph IR.
//
// This mirrors docs/02-architecture/01-system-architecture.md's "Relational /
// Metadata Store: For explicit entity matching." Nodes and edges are stored
// as JSON blobs alongside a few indexed columns (id, type, name) so the
// retriever's Metadata Lookup can do fast SQL lookups without deserializing
// every row, while still preserving the full KnowledgeNode/KnowledgeEdge
// shape (sections, metrics, metadata) for callers that need it.
// ---------------------------------------------------------------------------

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS nodes (
  id       TEXT PRIMARY KEY,
  type     TEXT NOT NULL,
  name     TEXT NOT NULL,
  data     TEXT NOT NULL -- JSON-serialized KnowledgeNode
);

CREATE TABLE IF NOT EXISTS edges (
  id           TEXT PRIMARY KEY,
  source_node  TEXT NOT NULL,
  target_node  TEXT NOT NULL,
  type         TEXT NOT NULL,
  data         TEXT NOT NULL, -- JSON-serialized KnowledgeEdge
  FOREIGN KEY (source_node) REFERENCES nodes(id),
  FOREIGN KEY (target_node) REFERENCES nodes(id)
);

CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_node);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_node);
`;
