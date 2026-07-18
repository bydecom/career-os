import {
  EdgeType,
  NodeType,
  type KnowledgeGraph,
  type KnowledgeNode,
  type ExperienceMetadata,
  type ProjectMetadata,
  type ProfileMetadata,
  type TechnologyMetadata,
} from '@career-os/ontology';
import { extractBullets, extractSection, extractSummary, stripWikiLinks } from './sections.js';
import type {
  ProjectResumeOptions,
  ProjectResumeResult,
  ResumeDiagnostics,
  ResumeDiagnostic,
  ResumeEducation,
  ResumeExperience,
  ResumeIR,
  ResumeProfile,
  ResumeProject,
  ResumeSkill,
  ResumeScope,
} from './types.js';

const DEFAULTS = {
  scope: 'master' as ResumeScope,
  maxDecisions: 4,
  maxMetrics: 3,
  maxSummaryChars: 300,
};

function isNonEmpty(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function compareIdAsc(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function resolveName(graph: KnowledgeGraph, id: string): string {
  return graph.nodes.find((n) => n.id === id)?.name ?? id;
}

function projectTechnologies(
  graph: KnowledgeGraph,
  projectId: string
): { ids: string[]; names: string[] } {
  const byId = new Map<string, string>();
  for (const edge of graph.edges) {
    if (edge.sourceNode !== projectId) continue;
    if (edge.type !== EdgeType.USES && edge.type !== EdgeType.RELATED_TO) continue;
    const tech = graph.nodes.find((n) => n.id === edge.targetNode && n.type === NodeType.Technology);
    if (!tech) continue;
    byId.set(tech.id, tech.name);
  }
  const ids = [...byId.keys()].sort(compareIdAsc);
  return { ids, names: ids.map((id) => byId.get(id)!) };
}

function buildProfile(nodes: KnowledgeNode[]): ResumeProfile {
  const profiles = nodes.filter(
    (n) => n.type === NodeType.Profile && n.metadata.status !== 'deprecated'
  );
  if (profiles.length === 0) {
    throw new Error(
      'Resume projection requires exactly one active profile node (type: profile). Add career-data/nodes/profile/*.md'
    );
  }
  if (profiles.length > 1) {
    const ids = profiles.map((p) => p.id).join(', ');
    throw new Error(
      `Resume projection expects exactly one active profile; found ${profiles.length}: ${ids}`
    );
  }
  const node = profiles[0]!;
  const meta = node.metadata as ProfileMetadata;
  const fromBody = extractSection(node.body.raw, ['Summary']);
  const summary =
    (isNonEmpty(meta.summary) ? meta.summary!.trim() : '') ||
    stripWikiLinks(fromBody).replace(/\s+/g, ' ').trim() ||
    '';

  return {
    id: node.id,
    name: node.name,
    headline: meta.headline,
    location: meta.location,
    email: meta.email,
    github: meta.github,
    linkedin: meta.linkedin,
    website: meta.website,
    summary,
    specialties: extractBullets(node.body.raw, ['Specialties'], 8),
    stacks: extractBullets(node.body.raw, ['Technical Stacks'], 16),
  };
}

function experienceProjectIds(graph: KnowledgeGraph, experienceId: string): string[] {
  const ids = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.sourceNode !== experienceId && edge.targetNode !== experienceId) continue;
    const other = edge.sourceNode === experienceId ? edge.targetNode : edge.sourceNode;
    const node = graph.nodes.find((n) => n.id === other && n.type === NodeType.Project);
    if (node && node.metadata.status !== 'draft') ids.add(node.id);
  }
  return [...ids].sort(compareIdAsc);
}

function buildExperiences(graph: KnowledgeGraph): ResumeExperience[] {
  const rows = graph.nodes
    .filter((n) => n.type === NodeType.Experience && n.metadata.status !== 'draft')
    .map((n) => {
      const meta = n.metadata as ExperienceMetadata;
      return {
        id: n.id,
        name: n.name,
        role: meta.role,
        companyId: meta.company,
        companyName: resolveName(graph, meta.company),
        startDate: meta.startDate,
        endDate: meta.endDate,
        team: meta.team,
        summary: extractSummary(n.body.raw, DEFAULTS.maxSummaryChars),
        highlights: extractBullets(n.body.raw, ['Highlights', 'Key Decisions'], 6),
        projectIds: experienceProjectIds(graph, n.id),
        _start: meta.startDate,
      };
    });

  rows.sort((a, b) => {
    const byDate = b._start.localeCompare(a._start);
    if (byDate !== 0) return byDate;
    return compareIdAsc(a.id, b.id);
  });

  return rows.map(({ _start: _, ...rest }) => rest);
}

function buildProjects(
  graph: KnowledgeGraph,
  options: Required<Pick<ProjectResumeOptions, 'maxDecisions' | 'maxMetrics' | 'maxSummaryChars'>>
): ResumeProject[] {
  const rows = graph.nodes
    .filter((n) => n.type === NodeType.Project && n.metadata.status !== 'draft')
    .map((n) => {
      const meta = n.metadata as ProjectMetadata;
      const tech = projectTechnologies(graph, n.id);
      return {
        id: n.id,
        name: n.name,
        role: meta.role,
        period: meta.period,
        summary: extractSummary(n.body.raw, options.maxSummaryChars),
        keyDecisions: extractBullets(
          n.body.raw,
          ['Highlights', 'Engineering Decisions', 'Key Decisions'],
          options.maxDecisions,
        ),
        metrics: extractBullets(n.body.raw, ['Metrics'], options.maxMetrics),
        technologies: tech.names,
        _techIds: tech.ids,
        _updated: meta.updated ?? meta.created ?? '',
      };
    });

  rows.sort((a, b) => {
    const byUpdated = b._updated.localeCompare(a._updated);
    if (byUpdated !== 0) return byUpdated;
    return compareIdAsc(a.id, b.id);
  });

  return rows.map(({ _updated: _, _techIds: __, ...rest }) => rest);
}

function buildSkills(graph: KnowledgeGraph, projects: ResumeProject[]): ResumeSkill[] {
  const selectedIds = new Set(projects.map((p) => p.id));
  const byId = new Map<string, ResumeSkill>();

  for (const edge of graph.edges) {
    if (!selectedIds.has(edge.sourceNode)) continue;
    if (edge.type !== EdgeType.USES && edge.type !== EdgeType.RELATED_TO) continue;
    const tech = graph.nodes.find(
      (n) => n.id === edge.targetNode && n.type === NodeType.Technology
    );
    if (!tech || tech.metadata.status === 'deprecated') continue;
    const meta = tech.metadata as TechnologyMetadata;
    byId.set(tech.id, {
      id: tech.id,
      name: tech.name,
      category: meta.category,
    });
  }

  return [...byId.values()].sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) return byName;
    return compareIdAsc(a.id, b.id);
  });
}

function buildEducation(graph: KnowledgeGraph): ResumeEducation[] {
  return graph.nodes
    .filter(
      (n) =>
        (n.type === NodeType.Course || n.type === NodeType.Certificate) &&
        n.metadata.status !== 'draft'
    )
    .map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type === NodeType.Certificate ? ('certificate' as const) : ('course' as const),
      summary: extractSummary(n.body.raw, 200),
    }))
    .sort((a, b) => compareIdAsc(a.id, b.id));
}

function buildDiagnostics(ir: ResumeIR): ResumeDiagnostics {
  const warnings: ResumeDiagnostic[] = [];
  const errors: ResumeDiagnostic[] = [];

  if (!isNonEmpty(ir.profile.summary)) {
    warnings.push({
      level: 'warning',
      code: 'PROFILE_SUMMARY_EMPTY',
      message: 'profile summary is empty',
    });
  }
  for (const field of ['email', 'github', 'linkedin', 'website', 'location'] as const) {
    if (!isNonEmpty(ir.profile[field])) {
      warnings.push({
        level: 'warning',
        code: `PROFILE_${field.toUpperCase()}_EMPTY`,
        message: `profile.${field} empty`,
      });
    }
  }
  if (ir.education.length === 0) {
    warnings.push({
      level: 'warning',
      code: 'EDUCATION_MISSING',
      message: 'education missing',
    });
    warnings.push({
      level: 'warning',
      code: 'CERTIFICATE_MISSING',
      message: 'no certificate',
    });
  }
  if (ir.experiences.length === 0) {
    warnings.push({
      level: 'warning',
      code: 'EXPERIENCE_EMPTY',
      message: 'no experience nodes',
    });
  }
  if (ir.projects.length === 0) {
    warnings.push({
      level: 'warning',
      code: 'PROJECTS_EMPTY',
      message: 'no project nodes',
    });
  }

  return {
    profileOk: errors.length === 0,
    experienceCount: ir.experiences.length,
    projectCount: ir.projects.length,
    skillCount: ir.skills.length,
    educationCount: ir.education.length,
    warnings,
    errors,
  };
}

/**
 * Deterministic master resume projection.
 * Does not call Retriever / BM25 / RRF / Vector / LLM.
 */
export function projectResume(
  graph: KnowledgeGraph,
  options: ProjectResumeOptions = {}
): ProjectResumeResult {
  const scope = options.scope ?? DEFAULTS.scope;
  if (scope === 'tailored') {
    throw new Error(
      'scope: "tailored" is not implemented yet (v1.1+). Use career resume without --jd for master.'
    );
  }

  const limits = {
    maxDecisions: options.maxDecisions ?? DEFAULTS.maxDecisions,
    maxMetrics: options.maxMetrics ?? DEFAULTS.maxMetrics,
    maxSummaryChars: options.maxSummaryChars ?? DEFAULTS.maxSummaryChars,
  };

  const profile = buildProfile(graph.nodes);
  const experiences = buildExperiences(graph);
  const projects = buildProjects(graph, limits);
  const skills = buildSkills(graph, projects);
  const education = buildEducation(graph);

  const ir: ResumeIR = {
    scope,
    profile,
    experiences,
    projects,
    skills,
    education,
  };

  return { ir, diagnostics: buildDiagnostics(ir) };
}

export function formatDiagnostics(diagnostics: ResumeDiagnostics): string {
  const lines = [
    `Profile     : ${diagnostics.profileOk ? 'OK' : 'ERROR'}`,
    `Experience  : ${diagnostics.experienceCount}`,
    `Projects    : ${diagnostics.projectCount}`,
    `Skills      : ${diagnostics.skillCount}`,
    `Education   : ${diagnostics.educationCount}`,
  ];
  if (diagnostics.warnings.length > 0) {
    lines.push('', 'Warnings');
    for (const w of diagnostics.warnings) {
      lines.push(`- ${w.message}`);
    }
  }
  if (diagnostics.errors.length > 0) {
    lines.push('', 'Errors');
    for (const e of diagnostics.errors) {
      lines.push(`- ${e.message}`);
    }
  }
  return lines.join('\n');
}
