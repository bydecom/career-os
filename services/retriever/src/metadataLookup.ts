import type { KnowledgeNode } from '@career-os/ontology';
import { tokenize } from './tokenize.js';

// ---------------------------------------------------------------------------
// Metadata Lookup — Step 1 of Progressive Certainty Retrieval (ADR-0004).
//
// Before any fuzzy matching, try to resolve the query directly to concrete
// Node IDs via exact matches against `id`, `name`, or `aliases`. This is the
// deterministic "Entity Normalization" stage described in the ADR: no NLP,
// no embeddings — a resolved match here is 100% certain and becomes the
// anchor/seed for Graph PPR.
// ---------------------------------------------------------------------------

export interface MetadataMatch {
  nodeId: string;
  /** What in the query matched: the exact string that resolved to this node. */
  matchedTerm: string;
  /** Which field produced the match. */
  matchedField: 'id' | 'name' | 'alias';
}

export class MetadataIndex {
  /** normalized term (id/name/alias) -> nodeId */
  private readonly termToNodeId = new Map<string, { nodeId: string; field: MetadataMatch['matchedField'] }>();

  constructor(nodes: KnowledgeNode<any>[]) {
    for (const node of nodes) {
      this.register(node.id.toLowerCase(), node.id, 'id');
      this.register(node.name.toLowerCase(), node.id, 'name');
      for (const alias of node.metadata.aliases ?? []) {
        this.register(alias.toLowerCase(), node.id, 'alias');
      }
    }
  }

  private register(term: string, nodeId: string, field: MetadataMatch['matchedField']): void {
    // First registration wins (id/name registered before aliases), preserving
    // determinism if two nodes happen to share an alias.
    if (!this.termToNodeId.has(term)) {
      this.termToNodeId.set(term, { nodeId, field });
    }
  }

  /**
   * Attempts to resolve the query to known node identities.
   *
   * Matches both the whole query string (e.g. "message broker" as a single
   * alias) and individual tokens (e.g. "RabbitMQ" inside a longer sentence),
   * since queries are natural-language sentences, not bare entity names.
   */
  lookup(query: string): MetadataMatch[] {
    const matches = new Map<string, MetadataMatch>();
    const normalizedQuery = query.toLowerCase().trim();

    const wholeMatch = this.termToNodeId.get(normalizedQuery);
    if (wholeMatch) {
      matches.set(wholeMatch.nodeId, {
        nodeId: wholeMatch.nodeId,
        matchedTerm: normalizedQuery,
        matchedField: wholeMatch.field,
      });
    }

    for (const term of tokenize(query)) {
      const hit = this.termToNodeId.get(term);
      if (hit && !matches.has(hit.nodeId)) {
        matches.set(hit.nodeId, { nodeId: hit.nodeId, matchedTerm: term, matchedField: hit.field });
      }
    }

    // Also check multi-word aliases (e.g. "message broker") as a substring of
    // the query, since tokenizing the query alone would split them apart.
    for (const [term, hit] of this.termToNodeId) {
      if (term.includes(' ') && normalizedQuery.includes(term) && !matches.has(hit.nodeId)) {
        matches.set(hit.nodeId, { nodeId: hit.nodeId, matchedTerm: term, matchedField: hit.field });
      }
    }

    return Array.from(matches.values());
  }
}
