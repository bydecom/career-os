import { DatabaseSync } from 'node:sqlite';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { SCHEMA_SQL } from './schema.js';

// ---------------------------------------------------------------------------
// GraphStore — SQLite persistence for the compiled Knowledge Graph.
//
// The Compiler is the only writer (per the "Read-Only by Default" API
// principle in docs/02-architecture/06-api-design.md): `write()` replaces
// the entire graph atomically inside a transaction on every compile.
// Everything else (`apps/cli query`, future `apps/api`) only ever reads.
//
// Built on node:sqlite (Node >= 22.5, currently experimental) instead of
// better-sqlite3 to avoid a native/compiled dependency in this monorepo.
// ---------------------------------------------------------------------------

export class GraphStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec(SCHEMA_SQL);
  }

  /** Replaces the entire stored graph with `graph`, atomically. */
  write(graph: KnowledgeGraph): void {
    this.db.exec('BEGIN TRANSACTION');
    try {
      this.db.exec('DELETE FROM edges');
      this.db.exec('DELETE FROM nodes');

      const insertNode = this.db.prepare('INSERT INTO nodes (id, type, name, data) VALUES (?, ?, ?, ?)');
      for (const node of graph.nodes) {
        insertNode.run(node.id, node.type, node.name, JSON.stringify(node));
      }

      const insertEdge = this.db.prepare(
        'INSERT INTO edges (id, source_node, target_node, type, data) VALUES (?, ?, ?, ?, ?)'
      );
      for (const edge of graph.edges) {
        insertEdge.run(edge.id, edge.sourceNode, edge.targetNode, edge.type, JSON.stringify(edge));
      }

      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  /** Reads back the full graph (all nodes + edges). */
  readAll(): KnowledgeGraph {
    const nodeRows = this.db.prepare('SELECT data FROM nodes').all() as { data: string }[];
    const edgeRows = this.db.prepare('SELECT data FROM edges').all() as { data: string }[];

    return {
      nodes: nodeRows.map((row) => JSON.parse(row.data) as KnowledgeNode<any>),
      edges: edgeRows.map((row) => JSON.parse(row.data) as KnowledgeEdge),
    };
  }

  getNode(id: string): KnowledgeNode<any> | undefined {
    const row = this.db.prepare('SELECT data FROM nodes WHERE id = ?').get(id) as { data: string } | undefined;
    return row ? (JSON.parse(row.data) as KnowledgeNode<any>) : undefined;
  }

  getNodesByType(type: string): KnowledgeNode<any>[] {
    const rows = this.db.prepare('SELECT data FROM nodes WHERE type = ?').all(type) as { data: string }[];
    return rows.map((row) => JSON.parse(row.data) as KnowledgeNode<any>);
  }

  getEdgesForNode(nodeId: string, direction: 'out' | 'in' | 'both' = 'both'): KnowledgeEdge[] {
    const rows: { data: string }[] = [];
    if (direction === 'out' || direction === 'both') {
      rows.push(...(this.db.prepare('SELECT data FROM edges WHERE source_node = ?').all(nodeId) as { data: string }[]));
    }
    if (direction === 'in' || direction === 'both') {
      rows.push(...(this.db.prepare('SELECT data FROM edges WHERE target_node = ?').all(nodeId) as { data: string }[]));
    }
    return rows.map((row) => JSON.parse(row.data) as KnowledgeEdge);
  }

  close(): void {
    this.db.close();
  }
}
