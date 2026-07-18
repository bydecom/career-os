// ---------------------------------------------------------------------------
// ResumeIR — Intermediate Representation for resume projections.
// Renderers (Markdown / HTML / PDF / JSON Resume) consume this only.
// ---------------------------------------------------------------------------

export type ResumeScope = 'master' | 'tailored';

export interface ProjectResumeOptions {
  /** Business language: master = full graph projection; tailored = JD-constrained (v1.1+). */
  scope?: ResumeScope;
  /** Max Highlights / Key Decisions bullets per project. Default 4. */
  maxDecisions?: number;
  /** Max Metrics bullets per project. Default 3. */
  maxMetrics?: number;
  /** Max characters for project summary. Default 400. */
  maxSummaryChars?: number;
}

export interface ResumeProfile {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  summary: string;
  /** Bullets from profile ## Specialties */
  specialties: string[];
  /** Bullets from profile ## Technical Stacks */
  stacks: string[];
}

export interface ResumeExperience {
  id: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
  startDate: string;
  endDate?: string;
  team?: string;
  summary: string;
  /** Bullets from ## Highlights / Key Decisions */
  highlights: string[];
  /** Project ids linked from experience Evidence wiki-links / edges */
  projectIds: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  role?: string;
  period?: string;
  summary: string;
  keyDecisions: string[];
  metrics: string[];
  technologies: string[]; // display names, already deduped per project
}

export interface ResumeSkill {
  id: string;
  name: string;
  category?: string;
}

export interface ResumeEducation {
  id: string;
  name: string;
  type: 'course' | 'certificate';
  summary: string;
}

export interface ResumeIR {
  scope: ResumeScope;
  profile: ResumeProfile;
  experiences: ResumeExperience[];
  projects: ResumeProject[];
  skills: ResumeSkill[];
  education: ResumeEducation[];
}

export interface ResumeDiagnostic {
  level: 'info' | 'warning' | 'error';
  code: string;
  message: string;
}

export interface ResumeDiagnostics {
  profileOk: boolean;
  experienceCount: number;
  projectCount: number;
  skillCount: number;
  educationCount: number;
  warnings: ResumeDiagnostic[];
  errors: ResumeDiagnostic[];
}

export interface ProjectResumeResult {
  ir: ResumeIR;
  diagnostics: ResumeDiagnostics;
}
