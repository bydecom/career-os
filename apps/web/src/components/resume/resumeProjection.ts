import type { ResumeIR } from '@career-os/resume';
import { pickFeaturedProjects } from '@/components/marketing/featuredData';

/** CV-order project groups for the Resume projection (matches traditional CV). */
export const PROJECT_GROUPS: { title: string; ids: string[] }[] = [
  {
    title: 'FPT Software (OJT)',
    ids: ['ecommerce-platform', 'movie-theater-management-system'],
  },
  {
    title: 'Open Source / Personal R&D',
    ids: [
      'career-os',
      'graphrag-code',
      'medical-citation-agent',
      'conversational-state-machine',
    ],
  },
  {
    title: 'Freelance',
    ids: ['container-bay-plan-validator', 'match-3-puzzle-game'],
  },
];

export function featuredCapabilities(ir: ResumeIR) {
  return pickFeaturedProjects(ir).map((p) => ({
    id: p.id,
    capability: p.capability,
    name: p.name,
    tagline: p.tagline,
    href: `/project/${p.id}`,
  }));
}

/** Prefer IR headline from profile markdown (CV source of truth). */
export function projectionHeadline(ir: ResumeIR): string {
  return ir.profile.headline?.trim() || 'Software Developer';
}

/** Prefer IR summary from profile ## Summary — no CareerOS copy override. */
export function projectionSummary(ir: ResumeIR): string {
  return (
    ir.profile.summary?.trim() ||
    'Software Developer with hands-on experience building production-grade systems and deterministic AI pipelines.'
  );
}
