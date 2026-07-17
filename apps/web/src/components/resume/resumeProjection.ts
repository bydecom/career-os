import type { ResumeIR, ResumeSkill } from '@career-os/resume';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';

export const RESUME_TAGLINE = 'Compile knowledge into structured, reusable systems.';

/** Capability interests shown under Summary — hire-first positioning. */
export const INTERESTS = [
  'Knowledge Graph',
  'LLM Runtime',
  'Conversation Management',
  'Compiler Architecture',
  'Evidence-first AI',
] as const;

export const SELECTED_DESIGNS = [
  {
    title: 'Knowledge Compiler',
    href: '/project/career-os',
    blurb: 'Markdown → Graph IR → multi-surface projections',
  },
  {
    title: 'Conversation Stack Runtime',
    href: '/project/conversational-state-machine',
    blurb: 'Interruptions as deterministic LIFO policies',
  },
  {
    title: 'Evidence-first Retrieval',
    href: '/project/medical-citation-agent',
    blurb: 'Cite before generate — hallucination 0.00',
  },
  {
    title: 'Graph Projection Engine',
    href: '/project/graphrag-code',
    blurb: 'Structural answers without re-reading the repo',
  },
] as const;

/** Domain buckets for Skills — senior signal over tech dump. */
const DOMAIN_ORDER = ['Knowledge Systems', 'AI', 'Platform'] as const;

const DOMAIN_BY_SKILL_ID: Record<string, (typeof DOMAIN_ORDER)[number]> = {
  // Knowledge Systems
  remark: 'Knowledge Systems',
  unified: 'Knowledge Systems',
  'tree-sitter': 'Knowledge Systems',
  rustworkx: 'Knowledge Systems',
  sqlite: 'Knowledge Systems',
  qdrant: 'Knowledge Systems',
  // AI
  fastmcp: 'AI',
  'gemini-ai': 'AI',
  scispacy: 'AI',
  openfda: 'AI',
  // Platform
  typescript: 'Platform',
  nodejs: 'Platform',
  postgresql: 'Platform',
  redis: 'Platform',
  rabbitmq: 'Platform',
  docker: 'Platform',
  aws: 'Platform',
  prisma: 'Platform',
  react: 'Platform',
  angular: 'Platform',
  django: 'Platform',
  pm2: 'Platform',
};

/** Explicit domain seeds so empty IR categories still look intentional. */
const DOMAIN_SEEDS: Record<(typeof DOMAIN_ORDER)[number], string[]> = {
  'Knowledge Systems': [
    'Knowledge Graph',
    'Compiler / IR',
    'Ontology',
    'Hybrid Retrieval',
    'RAG',
  ],
  AI: ['LLM Runtime', 'Agents / MCP', 'Evaluation', 'Evidence-first extraction'],
  Platform: ['TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'SQLite'],
};

export type SkillDomain = {
  domain: (typeof DOMAIN_ORDER)[number];
  items: string[];
};

export function groupSkillsByDomain(skills: ResumeSkill[]): SkillDomain[] {
  const buckets: Record<(typeof DOMAIN_ORDER)[number], Set<string>> = {
    'Knowledge Systems': new Set(DOMAIN_SEEDS['Knowledge Systems']),
    AI: new Set(DOMAIN_SEEDS.AI),
    Platform: new Set(DOMAIN_SEEDS.Platform),
  };

  for (const skill of skills) {
    const domain = DOMAIN_BY_SKILL_ID[skill.id];
    if (!domain) continue;
    buckets[domain].add(skill.name);
  }

  return DOMAIN_ORDER.map((domain) => ({
    domain,
    items: Array.from(buckets[domain]),
  }));
}

export function featuredCapabilities(ir: ResumeIR) {
  return pickFeaturedProjects(ir).map((p) => ({
    id: p.id,
    capability: p.capability,
    name: p.name,
    tagline: p.tagline,
    href: `/project/${p.id}`,
  }));
}

export function projectionHeadline(ir: ResumeIR): string {
  // Prefer CareerOS positioning even if IR lags a recompile.
  if (ir.profile.headline?.includes('Knowledge')) return ir.profile.headline;
  return 'Knowledge Systems Engineer';
}

export function projectionSummary(ir: ResumeIR): string {
  if (ir.profile.summary?.toLowerCase().includes('deterministic knowledge')) {
    return ir.profile.summary;
  }
  return 'Build deterministic knowledge systems. Interested in Knowledge Graphs, LLM runtime control, conversation management, compiler architecture, and evidence-first AI.';
}
