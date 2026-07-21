// ---------------------------------------------------------------------------
// ConversationIR — Intermediate Representation between Retriever and LLM.
//
// Knowledge Graph → Retriever → ConversationIR → PromptRenderer → LLM
// The LLM only verbalizes this IR; it never invents facts.
// ---------------------------------------------------------------------------

export type RetrievalEngine = 'metadata' | 'graph' | 'bm25' | 'vector' | 'context';

export interface CandidateNode {
  id: string;
  type: string;
  name: string;
  excerpt: string;
  score: number;
  engines: RetrievalEngine[];
}

export interface ConversationEdge {
  source: string;
  target: string;
  type: string;
}

export interface ConversationSection {
  heading: string;
  body: string;
}

export interface RetrievalTraceStep {
  nodeId: string;
  name: string;
  engines: RetrievalEngine[];
  selected: boolean;
  rank?: number;
}

export interface ConversationIR {
  question: string;
  /** Aggregated confidence in [0, 1]. Labels (High/Medium/Low) are render-only. */
  confidence: number;
  anchorNodes: CandidateNode[];
  candidateNodes: CandidateNode[];
  edges: ConversationEdge[];
  sections: ConversationSection[];
  retrievalTrace: RetrievalTraceStep[];
  /** Rough character count of selected content (budget hint, not exact tokens). */
  tokenBudgetHint: number;
}

/** Minimal retrieve-result shape the builder needs (structurally typed). */
export interface RetrieveHit {
  node: {
    id: string;
    type: string;
    name: string;
    body: { raw: string };
  };
  explanation: {
    score: number;
    reasons: string[];
    engines: RetrievalEngine[];
  };
}
