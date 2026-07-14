import { z } from 'zod';
import { NodeType } from '@career-os/ontology';

// ---------------------------------------------------------------------------
// Base Metadata Schema (all nodes)
// ---------------------------------------------------------------------------
export const BaseMetadataSchema = z.object({
  id: z.string().min(1, 'id is required'),
  type: z.nativeEnum(NodeType, { errorMap: () => ({ message: `type must be one of: ${Object.values(NodeType).join(', ')}` }) }),
  name: z.string().min(1, 'name is required'),
  schemaVersion: z.string().default('1'),
  aliases: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'deprecated', 'draft']).optional().default('active'),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type BaseMetadataInput = z.input<typeof BaseMetadataSchema>;

// ---------------------------------------------------------------------------
// Domain-specific Schemas
// ---------------------------------------------------------------------------
export const ProjectMetadataSchema = BaseMetadataSchema.extend({
  role: z.string().optional(),
  company: z.string().optional(),
  period: z.string().optional(),
  repository: z.string().url().optional(),
  demo: z.string().url().optional(),
  visibility: z.enum(['public', 'private']).optional().default('private'),
});

export const TechnologyMetadataSchema = BaseMetadataSchema.extend({
  category: z.string().optional(),
  level: z.enum(['expert', 'intermediate', 'beginner']).optional(),
});

export const ExperienceMetadataSchema = BaseMetadataSchema.extend({
  role: z.string().min(1, 'role is required for experience nodes'),
  company: z.string().min(1, 'company is required for experience nodes'),
  team: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['full-time', 'contract', 'freelance']).optional().default('full-time'),
  startDate: z.string().min(1, 'startDate is required for experience nodes'),
  endDate: z.string().optional(),
});

export const DecisionMetadataSchema = BaseMetadataSchema.extend({
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  reviewed: z.boolean().optional().default(false),
});

export const ConceptMetadataSchema = BaseMetadataSchema.extend({
  domain: z.string().optional(),
});

export const CompanyMetadataSchema = BaseMetadataSchema.extend({
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
});

export const AchievementMetadataSchema = BaseMetadataSchema.extend({
  project: z.string().optional(),
  impact: z.string().optional(),
  evidence: z.array(z.string()).optional().default([]),
});

/** Profile is a presentation node (resume header). May merge into Person in v2. */
export const ProfileMetadataSchema = BaseMetadataSchema.extend({
  headline: z.string().optional(),
  location: z.string().optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  summary: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Schema Registry — maps NodeType → Zod Schema
// ---------------------------------------------------------------------------
export const schemaRegistry: Partial<Record<NodeType, z.ZodObject<any>>> = {
  [NodeType.Project]:      ProjectMetadataSchema,
  [NodeType.Technology]:   TechnologyMetadataSchema,
  [NodeType.Experience]:   ExperienceMetadataSchema,
  [NodeType.Decision]:     DecisionMetadataSchema,
  [NodeType.Concept]:      ConceptMetadataSchema,
  [NodeType.Company]:      CompanyMetadataSchema,
  [NodeType.Achievement]:  AchievementMetadataSchema,
  [NodeType.Profile]:      ProfileMetadataSchema,
};

/**
 * Validate raw frontmatter against the correct schema for its node type.
 * Falls back to BaseMetadataSchema if no specific schema exists for the type.
 */
export function validateFrontmatter(
  raw: Record<string, unknown>,
  filePath: string
): { success: true; data: z.infer<typeof BaseMetadataSchema> } | { success: false; errors: string[] } {
  // First validate the base to get the type
  const base = BaseMetadataSchema.safeParse(raw);
  if (!base.success) {
    return {
      success: false,
      errors: base.error.errors.map((e) => `[${filePath}] ${e.path.join('.')}: ${e.message}`),
    };
  }

  const nodeType = base.data.type as NodeType;
  const schema = schemaRegistry[nodeType] ?? BaseMetadataSchema;
  const result = schema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map((e) => `[${filePath}] ${e.path.join('.')}: ${e.message}`),
    };
  }

  return { success: true, data: result.data as z.infer<typeof BaseMetadataSchema> };
}
