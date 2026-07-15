import type { ResumeIR } from '@career-os/resume';
import type { FeaturedProject } from './FeaturedProjects';

const FEATURED_IDS = [
  'career-os',
  'graphrag-code',
  'medical-citation-agent',
  'ecommerce-platform',
] as const;

const FALLBACK_METRICS: Record<string, string> = {
  'career-os': 'Knowledge compiler · ResumeIR live',
  'graphrag-code': '~90% token reduction on structural queries',
  'medical-citation-agent': 'Citation precision 1.00 · Hallucination 0.00',
  'ecommerce-platform': '132+ deploys · 53+ concurrency tests',
};

export function pickFeaturedProjects(ir: ResumeIR | null): FeaturedProject[] {
  const fromIr: FeaturedProject[] = [];
  for (const id of FEATURED_IDS) {
    const p = ir?.projects.find((x) => x.id === id);
    if (!p) continue;
    fromIr.push({
      id: p.id,
      name: p.name,
      role: p.role,
      period: p.period,
      metric: p.metrics[0] ?? FALLBACK_METRICS[id] ?? 'From Knowledge Graph',
      blurb: p.summary || FALLBACK_METRICS[id] || '',
      stack: p.technologies,
    });
  }

  if (fromIr.length >= 2) return fromIr;

  return FEATURED_IDS.map((id) => ({
    id,
    name: id
      .split('-')
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(' '),
    metric: FALLBACK_METRICS[id] ?? '',
    blurb: 'Run career compile && career resume to hydrate cards from ResumeIR.',
    stack: [],
  }));
}
