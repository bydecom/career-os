import { randomUUID } from 'crypto';
import type {
  KnowledgeNode,
  KnowledgeEdge,
  KnowledgeGraph,
  CompilerDiagnostic,
  CompileResult,
} from '@career-os/ontology';
import type { WikiLink } from '../parser/index.js';
import { inferEdgeType } from '../validator/ontology.js';
import { validateOntology } from '../validator/ontology.js';

// ---------------------------------------------------------------------------
// Graph Builder
// Receives a list of compiled nodes + their wiki-links.
// Constructs the full KnowledgeGraph + runs ontology validation.
// ---------------------------------------------------------------------------

export interface NodeWithLinks {
  node: KnowledgeNode<any>;
  wikiLinks: WikiLink[];
}

/**
 * Build a KnowledgeGraph from all compiled nodes.
 * Steps:
 * 1. Index all nodes by ID
 * 2. For each wiki-link, resolve the target node and create a KnowledgeEdge
 * 3. Run ontology-level validation on the completed graph
 */
export function buildGraph(
  items: NodeWithLinks[],
  startTimeMs: number
): CompileResult {
  const diagnostics: CompilerDiagnostic[] = [];
  const nodes: KnowledgeNode<any>[] = items.map((i) => i.node);

  // Build lookup: (id | normalized-alias) → node id
  const aliasToId = new Map<string, string>();
  for (const node of nodes) {
    aliasToId.set(node.id, node.id);
    const aliases = (node.metadata.aliases as string[] | undefined) ?? [];
    for (const alias of aliases) {
      aliasToId.set(alias.toLowerCase().replace(/\s+/g, '-'), node.id);
    }
  }

  // Build edges from wiki-links
  const edges: KnowledgeEdge[] = [];
  const wikiLinksByNodeId = new Map<string, WikiLink[]>();

  for (const { node, wikiLinks } of items) {
    wikiLinksByNodeId.set(node.id, wikiLinks);

    for (const link of wikiLinks) {
      const targetId = aliasToId.get(link.target);
      if (!targetId) continue; // Unresolved links handled by ontology validator

      // Avoid self-loops
      if (targetId === node.id) continue;

      const edgeType = inferEdgeType(link.section);
      const edgeId = `${node.id}__${edgeType}__${targetId}`;

      // Deduplicate edges (same source-type-target triple)
      if (edges.some((e) => e.id === edgeId)) continue;

      edges.push({
        id: edgeId,
        sourceNode: node.id,
        targetNode: targetId,
        type: edgeType,
        metadata: {
          confidence: 0.9,
          source: 'wiki-link',
          createdBy: 'graph-builder',
          reason: `Derived from [[${link.raw}]] under section "${link.section}"`,
        },
        source: node.source,
      });
    }
  }

  const graph: KnowledgeGraph = { nodes, edges };

  // Run ontology validation
  const ontologyResult = validateOntology(graph, wikiLinksByNodeId);
  diagnostics.push(...ontologyResult.diagnostics);

  const parseTimeMs = Date.now() - startTimeMs;

  return {
    graph,
    diagnostics,
    statistics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      parseTimeMs,
    },
  };
}
