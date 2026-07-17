import type { ResumeIR } from '@career-os/resume';
import type { FeaturedProduct } from './FeaturedProjects';
import type { GraphStats } from '@/lib/loadGenerated';

/**
 * Landing Product Cards — each card sells one capability, not a stack dump.
 * IR hydrates name/role/period when available; copy stays hire-first curated.
 * CareerOS node/edge metrics hydrate from compiler `stats.json` (not hand-edited).
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
      { label: 'Nodes', value: '—' },
      { label: 'Edges', value: '—' },
      { label: 'Compilers', value: '6' },
    ],
    primaryCta: { label: 'Read Architecture', href: '#architecture' },
    secondaryCta: { label: 'Open Project', href: '/project/career-os' },
  },
  {
    id: 'graphrag-code',
    name: 'GraphRAG-Code',
    capability: 'Code Reasoning',
    tagline: 'Bidirectional PPR — blast radius without dumping the repo',
    problem:
      '“What breaks if I change this?” still means feeding the codebase to an LLM — slow, costly, and incomplete.',
    outcome:
      'Bidirectional Personalized PageRank + MCP snippets: P@10 ≈ 0.98 on real packages; forward-only ablation collapses to ~0.27.',
    architectureTeaser: 'Tree-sitter · Bidirectional PPR · FastMCP snippets',
    metrics: [
      { label: 'P@10', value: '≈0.98' },
      { label: 'Ablation', value: '0.27→0.98' },
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
    tagline: 'Enterprise interruption — selective stack parity, not a chatbot skin',
    problem:
      'Book a ticket, interrupt to order food, then resume — naive LLM chat loses the original task; enterprise stacks hide the control plane.',
    outcome:
      'ContextObject + 4 LIFO policies + slot-first schema: LLM fills catalog-constrained slots; runtime owns hold/resume. Vitest 10/10.',
    architectureTeaser: 'Slot-first · Schema builder · onHoldTasks LIFO · 4 policies',
    metrics: [
      { label: 'Policies', value: '4' },
      { label: 'Tests', value: '10/10' },
      { label: 'Core', value: 'ContextObject' },
    ],
    primaryCta: { label: 'Open Project', href: '/project/conversational-state-machine' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/bydecom/conversational-state-machine' },
  },
  {
    id: 'ecommerce-platform',
    name: 'E-Commerce Platform',
    capability: 'Production Commerce',
    tagline: 'Money paths, stock races, deploy rollback — not CRUD',
    problem:
      'Tutorial shops skip what breaks in production: checkout races, VNPay retries, stolen refresh tokens, AI on the hot path.',
    outcome:
      'OJT build hardened on real AWS: Redis Lua stock holds, sync VNPay IPN, RabbitMQ AI workers, PM2 auto-rollback — 132+ deploys.',
    architectureTeaser: 'Angular · Express/PM2 · Redis holds · VNPay · RabbitMQ AI',
    metrics: [
      { label: 'Deploys', value: '132+' },
      { label: 'VNPay', value: '25/25' },
      { label: 'Save', value: '<10ms' },
    ],
    primaryCta: { label: 'Open Project', href: '/project/ecommerce-platform' },
    secondaryCta: { label: 'Live demo', href: 'https://d7ozoo9vtkn42.cloudfront.net/' },
  },
];

export function pickFeaturedProjects(
  ir: ResumeIR | null,
  stats?: GraphStats | null,
): FeaturedProduct[] {
  return PRODUCTS.map((product) => {
    const fromIr = ir?.projects.find((p) => p.id === product.id);
    const base: FeaturedProduct = fromIr
      ? {
          ...product,
          name: fromIr.name || product.name,
          role: fromIr.role,
          period: fromIr.period,
        }
      : product;

    if (product.id === 'career-os' && stats) {
      return {
        ...base,
        metrics: [
          { label: 'Nodes', value: String(stats.totalNodes) },
          { label: 'Edges', value: String(stats.totalEdges) },
          { label: 'Compilers', value: '6' },
        ],
      };
    }

    return base;
  });
}
