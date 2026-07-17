import type { ResumeIR } from '@career-os/resume';
import type { FeaturedProduct } from './FeaturedProjects';

/**
 * Landing Product Cards — each card sells one capability, not a stack dump.
 * IR hydrates name/role/period when available; copy stays hire-first curated.
 */
const PRODUCTS: FeaturedProduct[] = [
  {
    id: 'career-os',
    name: 'CareerOS',
    capability: 'Knowledge Compiler',
    tagline: 'Personal Knowledge Compiler',
    problem: 'Career knowledge lives in scattered docs — every surface rewrites the same story.',
    outcome: 'Compile Markdown into a Knowledge Graph, then project Resume · Portfolio · Interview.',
    architectureTeaser: 'ResumeIR · PortfolioIR · ConversationIR',
    metrics: [
      { label: 'Nodes', value: '48' },
      { label: 'Edges', value: '95' },
      { label: 'Compilers', value: '6' },
    ],
    primaryCta: { label: 'Read Architecture', href: '#architecture' },
    secondaryCta: { label: 'Open Project', href: '/project/career-os' },
  },
  {
    id: 'graphrag-code',
    name: 'GraphRAG-Code',
    capability: 'Code Reasoning',
    tagline: 'Structural answers without re-reading the repo',
    problem: '“What breaks if I change this?” usually means dumping the codebase into an LLM.',
    outcome: '~90% token reduction on structural queries — graph answers, LLM does not re-reason.',
    architectureTeaser: 'AST graph · Bidirectional PPR · MCP tools',
    metrics: [
      { label: 'P@10', value: '0.98' },
      { label: 'Tokens', value: '−90%' },
      { label: 'Eval', value: 'LLM-free' },
    ],
    primaryCta: { label: 'Open Project', href: '/project/graphrag-code' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/bydecom/graphrag-code' },
  },
  {
    id: 'medical-citation-agent',
    name: 'Medical Citation Agent',
    capability: 'Evidence-first AI',
    tagline: 'Citations before generation',
    problem: 'Medical assistants invent contraindications — confident answers, no traceable source.',
    outcome: 'Citation precision 1.00 · Hallucination 0.00 — LLM never invents the claim.',
    architectureTeaser: 'Deterministic extract · Line-level cite · Safety guardrail',
    metrics: [
      { label: 'Precision', value: '1.00' },
      { label: 'Hallucination', value: '0.00' },
      { label: 'Tests', value: '96' },
    ],
    primaryCta: { label: 'Open Project', href: '/project/medical-citation-agent' },
    secondaryCta: {
      label: 'GitHub',
      href: 'https://github.com/bydecom/medical-citation-agent',
    },
  },
  {
    id: 'conversational-state-machine',
    name: 'Conversational State Machine',
    capability: 'Dialogue Runtime',
    tagline: 'Interruptions as deterministic stack ops',
    problem:
      'Multi-turn bots lose the original task when users interrupt — naive LLM chat has no control plane.',
    outcome:
      'Dialogue Runtime: ContextObject + 4 LIFO policies + slot-first schema — LLM fills slots, runtime owns the switch.',
    architectureTeaser: 'Slot-first · Schema builder · ContextObject · 4 policies',
    metrics: [
      { label: 'Policies', value: '4' },
      { label: 'Tests', value: '10/10' },
      { label: 'Core', value: 'ContextObject' },
    ],
    primaryCta: { label: 'Open Project', href: '/project/conversational-state-machine' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/bydecom/conversational-state-machine' },
  },
];

export function pickFeaturedProjects(ir: ResumeIR | null): FeaturedProduct[] {
  return PRODUCTS.map((product) => {
    const fromIr = ir?.projects.find((p) => p.id === product.id);
    if (!fromIr) return product;
    return {
      ...product,
      name: fromIr.name || product.name,
      role: fromIr.role,
      period: fromIr.period,
    };
  });
}
