import { formatConfidenceLabel } from './confidence.js';
import type { ConversationIR, RetrievalEngine } from './types.js';

// ---------------------------------------------------------------------------
// PromptRenderer — projections of ConversationIR.
// toReasoning → deterministic CLI trace (never LLM-generated)
// toMarkdown  → prompt body for the verbalizer
// ---------------------------------------------------------------------------

const ENGINE_LABEL: Record<RetrievalEngine, string> = {
  metadata: 'Metadata',
  graph: 'Graph',
  bm25: 'BM25',
  vector: 'Vector',
};

export class PromptRenderer {
  /** Deterministic reasoning tree for CLI stdout. */
  toReasoning(ir: ConversationIR): string {
    const label = formatConfidenceLabel(ir.confidence);
    const lines: string[] = [
      `Retrieval Confidence: ${label} (${ir.confidence.toFixed(2)})`,
      '',
      'Reasoning',
      '─────────',
    ];

    const selected = ir.retrievalTrace.filter((s) => s.selected);
    if (selected.length === 0) {
      lines.push('No verified knowledge nodes matched this query.');
      return lines.join('\n');
    }

    // Prefer showing anchors first, then other selected nodes by rank.
    const ordered = [...selected].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    ordered.forEach((step, index) => {
      const engines = step.engines.map((e) => ENGINE_LABEL[e]).join(' + ') || 'unknown';
      const prefix = index === 0 ? '' : '  ↓ ';
      lines.push(`${prefix}${engines} ✓ ${step.name} (\`${step.nodeId}\`)`);
    });

    lines.push('');
    lines.push(`Selected: ${ir.candidateNodes.map((n) => n.id).join(', ')}`);

    if (ir.edges.length > 0) {
      lines.push('');
      lines.push('Edges');
      for (const edge of ir.edges.slice(0, 12)) {
        lines.push(`  ${edge.source} --${edge.type}--> ${edge.target}`);
      }
    }

    return lines.join('\n');
  }

  /** Markdown ConversationIR body injected into the LLM user prompt. */
  toMarkdown(ir: ConversationIR): string {
    const label = formatConfidenceLabel(ir.confidence);
    const parts: string[] = [
      `# ConversationIR`,
      ``,
      `Question: ${ir.question}`,
      `Retrieval Confidence: ${label} (${ir.confidence.toFixed(2)})`,
      ``,
    ];

    if (ir.anchorNodes.length > 0) {
      parts.push(`## Anchors`);
      for (const n of ir.anchorNodes) {
        parts.push(`- ${n.name} (\`${n.id}\`) [${n.engines.join(', ')}]`);
      }
      parts.push('');
    }

    for (const section of ir.sections) {
      parts.push(`## ${section.heading}`);
      parts.push(section.body);
      parts.push('');
    }

    if (ir.edges.length > 0) {
      parts.push(`## Relationships`);
      for (const edge of ir.edges) {
        parts.push(`- \`${edge.source}\` --${edge.type}--> \`${edge.target}\``);
      }
      parts.push('');
    }

    return parts.join('\n').trim();
  }
}

export const promptRenderer = new PromptRenderer();
