import type { KnowledgeNode, KnowledgeGraph, CompilerDiagnostic, KnowledgeEdge } from '@career-os/ontology';
import { EdgeType } from '@career-os/ontology';
import type { WikiLink } from '../parser/index.js';

// ---------------------------------------------------------------------------
// Ontology Validator
// Runs cross-graph validations AFTER all nodes have been compiled.
// ---------------------------------------------------------------------------
export interface OntologyValidationResult {
  diagnostics: CompilerDiagnostic[];
}

/**
 * Validate the entire graph for ontology-level constraints:
 * 1. Reference integrity: all wiki-links resolve to a known node ID or alias
 * 2. Alias conflicts: two nodes cannot share the same alias
 * 3. Orphan detection: nodes with no edges at all (warning only)
 */
export function validateOntology(
  graph: KnowledgeGraph,
  wikiLinksByNodeId: Map<string, WikiLink[]>
): OntologyValidationResult {
  const diagnostics: CompilerDiagnostic[] = [];

  // Build lookup: (id | alias) → node
  const lookupMap = buildLookupMap(graph.nodes, diagnostics);

  // Reference integrity check
  for (const [nodeId, links] of wikiLinksByNodeId.entries()) {
    const sourceNode = graph.nodes.find((n) => n.id === nodeId);
    for (const link of links) {
      if (!lookupMap.has(link.target)) {
        diagnostics.push({
          level: 'warning',
          code: 'BROKEN_LINK',
          message: `Node "${nodeId}" links to [[${link.raw}]] but no node with id or alias "${link.target}" exists.`,
          source: sourceNode?.source,
        });
      }
    }
  }

  // Orphan detection (warning only — isolated nodes are allowed but flagged)
  const connectedIds = new Set<string>();
  for (const edge of graph.edges) {
    connectedIds.add(edge.sourceNode);
    connectedIds.add(edge.targetNode);
  }
  for (const node of graph.nodes) {
    if (!connectedIds.has(node.id)) {
      diagnostics.push({
        level: 'info',
        code: 'ORPHAN_NODE',
        message: `Node "${node.id}" has no edges. Consider adding [[wiki-links]] to connect it to the graph.`,
        source: node.source,
      });
    }
  }

  return { diagnostics };
}

// ---------------------------------------------------------------------------
// Edge Type Inference from Wiki-link section context
// Based on the heading the link appears under, infer the semantic edge type.
// ---------------------------------------------------------------------------
const SECTION_TO_EDGE_TYPE: Record<string, EdgeType> = {
  'chosen-solution': EdgeType.USES,
  'solution':        EdgeType.USES,
  'used-in':         EdgeType.USES,
  'implements':      EdgeType.IMPLEMENTS,
  'depends-on':      EdgeType.DEPENDS_ON,
  'problem':         EdgeType.SOLVES,
  'solves':          EdgeType.SOLVES,
  'alternatives':    EdgeType.RELATED_TO,
  'rejected':        EdgeType.RELATED_TO,
  'references':      EdgeType.REFERENCES,
  'inspired-by':     EdgeType.INSPIRED_BY,
  'related-to':      EdgeType.RELATED_TO,
  'evidence':        EdgeType.VALIDATES,
  'proves':          EdgeType.PROVES,
  'enables':         EdgeType.ENABLES,
  'part-of':         EdgeType.PART_OF,
  'belongs-to':      EdgeType.BELONGS_TO,
};

export function inferEdgeType(section: string): EdgeType {
  const normalized = section.toLowerCase().replace(/\s+/g, '-');
  for (const [key, edgeType] of Object.entries(SECTION_TO_EDGE_TYPE)) {
    if (normalized.includes(key)) return edgeType;
  }
  return EdgeType.RELATED_TO; // Default fallback
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildLookupMap(
  nodes: KnowledgeNode<any>[],
  diagnostics: CompilerDiagnostic[]
): Map<string, KnowledgeNode<any>> {
  const map = new Map<string, KnowledgeNode<any>>();

  for (const node of nodes) {
    if (map.has(node.id)) {
      diagnostics.push({
        level: 'error',
        code: 'DUPLICATE_ID',
        message: `Duplicate node ID "${node.id}" detected.`,
        source: node.source,
      });
    }
    map.set(node.id, node);

    const aliases = (node.metadata.aliases as string[] | undefined) ?? [];
    for (const alias of aliases) {
      const aliasKey = alias.toLowerCase().replace(/\s+/g, '-');
      if (map.has(aliasKey)) {
        diagnostics.push({
          level: 'error',
          code: 'ALIAS_CONFLICT',
          message: `Alias "${alias}" on node "${node.id}" conflicts with an existing id or alias.`,
          source: node.source,
        });
      } else {
        map.set(aliasKey, node);
      }
    }
  }

  return map;
}
