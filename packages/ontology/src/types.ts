import { NodeType, EdgeType } from './taxonomy.js';

// -----------------------------------------------------------------------------
// Source Tracking (For Compiler Diagnostics)
// -----------------------------------------------------------------------------
export interface SourceLocation {
  filePath: string;
  lineStart: number;
  lineEnd: number;
}

// -----------------------------------------------------------------------------
// Markdown Body Processing
// -----------------------------------------------------------------------------
export interface Section {
  title: string;
  level: number;
  content: string; // The raw text under this section
  children: Section[];
}

export interface ParsedMarkdown {
  raw: string;
  html?: string;
  ast?: any; // The unist/remark AST root
  sections: Section[];
}

// -----------------------------------------------------------------------------
// Metadata Types (Strict Domain Models)
// -----------------------------------------------------------------------------
export interface BaseMetadata {
  schemaVersion: string;
  aliases?: string[];
  tags?: string[];
  status?: 'active' | 'deprecated' | 'draft';
  created?: string;
  updated?: string;
}

export interface ProjectMetadata extends BaseMetadata {
  role?: string;
  company?: string; // Node ID
  period?: string;
  repository?: string;
  demo?: string;
  visibility?: 'public' | 'private';
}

export interface TechnologyMetadata extends BaseMetadata {
  category?: string;
  level?: 'expert' | 'intermediate' | 'beginner';
}

export interface DecisionMetadata extends BaseMetadata {
  confidence?: 'high' | 'medium' | 'low';
  reviewed?: boolean;
}

export interface ExperienceMetadata extends BaseMetadata {
  role: string;
  company: string; // Node ID
  team?: string;
  location?: string;
  employmentType?: 'full-time' | 'contract' | 'freelance';
  startDate: string;
  endDate?: string;
}

/** Presentation / projection metadata for resume header. Not domain ontology. */
export interface ProfileMetadata extends BaseMetadata {
  headline?: string;
  location?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
}

// -----------------------------------------------------------------------------
// The Node Model
// -----------------------------------------------------------------------------
export interface KnowledgeNode<TMetadata extends BaseMetadata = BaseMetadata> {
  id: string;
  type: NodeType;
  name: string; // e.g. "RabbitMQ", "GraphRAG-Code"
  metadata: TMetadata;
  body: ParsedMarkdown;
  source: SourceLocation;
}

// -----------------------------------------------------------------------------
// The Edge Model
// -----------------------------------------------------------------------------
export interface EdgeMetadata {
  confidence: number; // e.g. 0.0 to 1.0
  source: 'wiki-link' | 'frontmatter' | 'inferred';
  createdBy: string; // Which compiler pass created this?
  reason?: string; // Explain why this edge exists (for debugging)
}

export interface KnowledgeEdge {
  id: string; // Unique identifier for the edge itself
  sourceNode: string; // Node ID
  targetNode: string; // Node ID
  type: EdgeType;
  metadata: EdgeMetadata;
  source?: SourceLocation; // If extracted from a specific line of markdown
}

// -----------------------------------------------------------------------------
// Compiler Output (Diagnostics & Graph)
// -----------------------------------------------------------------------------
export interface CompilerDiagnostic {
  level: 'info' | 'warning' | 'error';
  message: string;
  source?: SourceLocation;
  code: string; // e.g. "UNKNOWN_NODE", "CIRCULAR_RELATION", "BROKEN_LINK"
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode<any>[];
  edges: KnowledgeEdge[];
}

export interface CompileResult {
  graph: KnowledgeGraph;
  diagnostics: CompilerDiagnostic[];
  statistics: {
    totalNodes: number;
    totalEdges: number;
    parseTimeMs: number;
  };
}
