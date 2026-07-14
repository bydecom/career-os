import { describe, it, expect } from 'vitest';
import { NodeType, EdgeType } from '@career-os/ontology';
import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from '@career-os/ontology';
import { buildConversationIR } from '../src/builder.js';
import { applyBudget } from '../src/budget.js';
import { scoreConfidence, formatConfidenceLabel } from '../src/confidence.js';
import { PromptRenderer } from '../src/renderer.js';
import type { RetrieveHit } from '../src/types.js';

function makeNode(id: string, type: NodeType, body: string): KnowledgeNode<any> {
  return {
    id,
    type,
    name: id,
    metadata: { schemaVersion: '1' },
    body: { raw: body, sections: [] },
    source: { filePath: `${id}.md`, lineStart: 1, lineEnd: 1 },
  };
}

function makeEdge(source: string, target: string): KnowledgeEdge {
  return {
    id: `${source}->${target}`,
    sourceNode: source,
    targetNode: target,
    type: EdgeType.USES,
    metadata: { confidence: 1, source: 'wiki-link', createdBy: 'test' },
  };
}

function hit(node: KnowledgeNode<any>, engines: RetrieveHit['explanation']['engines'], score = 0.05): RetrieveHit {
  return {
    node,
    explanation: { score, reasons: engines.map((e) => `${e} match`), engines },
  };
}

describe('scoreConfidence', () => {
  it('sums unique engine weights and caps at 1', () => {
    expect(scoreConfidence(['metadata'])).toBeCloseTo(0.45);
    expect(scoreConfidence(['metadata', 'graph', 'bm25', 'vector'])).toBeCloseTo(1.0);
    expect(scoreConfidence(['metadata', 'metadata'])).toBeCloseTo(0.45);
  });

  it('maps scores to High / Medium / Low labels', () => {
    expect(formatConfidenceLabel(0.87)).toBe('High');
    expect(formatConfidenceLabel(0.5)).toBe('Medium');
    expect(formatConfidenceLabel(0.1)).toBe('Low');
  });
});

describe('buildConversationIR', () => {
  const rabbit = makeNode('rabbitmq', NodeType.Technology, 'A message broker for async queues.');
  const ecommerce = makeNode('ecommerce-platform', NodeType.Project, 'Uses RabbitMQ for order pipeline.');
  const graph: KnowledgeGraph = {
    nodes: [rabbit, ecommerce],
    edges: [makeEdge('ecommerce-platform', 'rabbitmq')],
  };

  it('marks metadata hits as anchors and includes related edges', () => {
    const ir = buildConversationIR(
      'Why RabbitMQ?',
      [hit(rabbit, ['metadata', 'bm25'], 0.08), hit(ecommerce, ['graph', 'bm25'], 0.06)],
      graph
    );

    expect(ir.anchorNodes.map((n) => n.id)).toEqual(['rabbitmq']);
    expect(ir.candidateNodes).toHaveLength(2);
    expect(ir.edges).toEqual([
      { source: 'ecommerce-platform', target: 'rabbitmq', type: EdgeType.USES },
    ]);
    expect(ir.confidence).toBeCloseTo(0.9); // metadata+graph+bm25
    expect(ir.retrievalTrace.every((s) => s.selected)).toBe(true);
  });

  it('groups sections by node type', () => {
    const ir = buildConversationIR('q', [hit(rabbit, ['bm25']), hit(ecommerce, ['bm25'])], graph);
    expect(ir.sections.map((s) => s.heading)).toEqual(['Projects', 'Technologies']);
  });
});

describe('applyBudget', () => {
  const nodes = Array.from({ length: 5 }, (_, i) =>
    makeNode(`n${i}`, NodeType.Technology, 'x'.repeat(500))
  );
  const graph: KnowledgeGraph = { nodes, edges: [] };

  it('respects topK and truncates excerpts', () => {
    const ir = buildConversationIR(
      'q',
      nodes.map((n) => hit(n, ['bm25'])),
      graph,
      { topK: 5 }
    );
    const budgeted = applyBudget(ir, { topK: 2, maxExcerptChars: 50 });

    expect(budgeted.candidateNodes).toHaveLength(2);
    expect(budgeted.candidateNodes[0]!.excerpt.length).toBeLessThanOrEqual(50);
    expect(budgeted.retrievalTrace.filter((s) => s.selected)).toHaveLength(2);
  });

  it('dedupes by node id', () => {
    const rabbit = makeNode('rabbitmq', NodeType.Technology, 'broker');
    const ir = buildConversationIR(
      'q',
      [hit(rabbit, ['metadata']), hit(rabbit, ['bm25'])],
      { nodes: [rabbit], edges: [] },
      { topK: 2 }
    );
    // builder keeps both slots if same id appears twice in hits — budget dedupes
    const budgeted = applyBudget(
      {
        ...ir,
        candidateNodes: [
          ...ir.candidateNodes,
          { ...ir.candidateNodes[0]!, engines: ['vector'] },
        ],
      },
      { topK: 5 }
    );
    expect(budgeted.candidateNodes.filter((n) => n.id === 'rabbitmq')).toHaveLength(1);
  });
});

describe('PromptRenderer', () => {
  const renderer = new PromptRenderer();
  const rabbit = makeNode('rabbitmq', NodeType.Technology, 'message broker');
  const ecommerce = makeNode('ecommerce-platform', NodeType.Project, 'order pipeline');
  const graph: KnowledgeGraph = {
    nodes: [rabbit, ecommerce],
    edges: [makeEdge('ecommerce-platform', 'rabbitmq')],
  };

  it('renders deterministic reasoning without inventing nodes', () => {
    const ir = applyBudget(
      buildConversationIR(
        'Why RabbitMQ?',
        [hit(rabbit, ['metadata', 'bm25'], 0.08), hit(ecommerce, ['graph'], 0.05)],
        graph
      )
    );
    const text = renderer.toReasoning(ir);

    expect(text).toContain('Retrieval Confidence: High');
    expect(text).toContain('Metadata');
    expect(text).toContain('rabbitmq');
    expect(text).toContain('Selected:');
  });

  it('renders markdown sections for the LLM prompt', () => {
    const ir = applyBudget(
      buildConversationIR('Why RabbitMQ?', [hit(rabbit, ['metadata'])], graph)
    );
    const md = renderer.toMarkdown(ir);

    expect(md).toContain('# ConversationIR');
    expect(md).toContain('## Technologies');
    expect(md).toContain('rabbitmq');
  });
});
