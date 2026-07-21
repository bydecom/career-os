export type AskNode = {
  id: string;
  name: string;
  type: string;
  score: number;
  engines: string[];
  excerpt: string;
};

export type AskEdge = {
  source: string;
  target: string;
  type: string;
};

/** A single engine's raw match (before fusion) — real scores, not simulated. */
export type EngineMatch = {
  nodeId: string;
  name: string;
  type: string;
  score?: number;
  matchedTerm?: string;
  matchedField?: string;
};

/** A node after RRF fusion, with the per-engine contributions that produced its score. */
export type FusedMatch = {
  nodeId: string;
  name: string;
  type: string;
  score: number;
  engines: string[];
  selected: boolean;
};

/** A node in the Knowledge Trace presentation projection. */
export type KnowledgeTraceNode = {
  id: string;
  type: string;
  name: string;
  score: number;
  engines: string[];
};

/**
 * Curated "Knowledge Used" view — Direct Matches = metadata anchors,
 * Supporting = other selected evidence, Additional = overflow (disclosed, not hidden).
 */
export type KnowledgeTrace = {
  directMatches: KnowledgeTraceNode[];
  supportingContext: KnowledgeTraceNode[];
  additionalContext: { count: number; names: string[] };
};

/**
 * Emitted live as the runtime executes each stage — powers the Execution
 * Trace. Every payload is real data pulled straight from the retriever /
 * conversation / LLM services, not a simulated "thinking" narrative.
 */
export type StageEvent =
  | {
      stage: 'retrieval';
      ms: number;
      usedVector: boolean;
      metadata: EngineMatch[];
      bm25: EngineMatch[];
      vector: EngineMatch[];
      graph: EngineMatch[];
      fusion: FusedMatch[];
      nodes: AskNode[];
    }
  | { stage: 'graph'; edges: AskEdge[] }
  | {
      stage: 'ir';
      intent: string;
      confidence: number;
      confidenceLabel: string;
      tokenBudgetHint: number;
      citations: string[];
      raw: unknown;
      knowledgeTrace: KnowledgeTrace;
      isContinuation?: boolean;
    }
  | { stage: 'prompt'; system: string; user: string; rendered: string; chars: number; estTokens: number }
  | { stage: 'llm_start'; provider: string; model: string; temperature: number; thinking: string }
  | {
      stage: 'answer';
      answer: string;
      llmMs: number;
      totalMs: number;
      provider: string;
      model: string;
      inputTokens?: number;
      outputTokens?: number;
    }
  | { stage: 'error'; message: string };

/** Aggregated view of all StageEvents so far — what the Execution Trace renders. */
export type AskResult = {
  question: string;
  answer?: string;
  intent?: string;
  confidence?: number;
  confidenceLabel?: string;
  knowledgeTrace?: KnowledgeTrace;
  isContinuation?: boolean;
  selectedNodes: AskNode[];
  edges: AskEdge[];
  metadata: EngineMatch[];
  bm25: EngineMatch[];
  vector: EngineMatch[];
  graphMatches: EngineMatch[];
  fusion: FusedMatch[];
  citations: string[];
  irRaw?: unknown;
  promptSystem?: string;
  promptUser?: string;
  promptRendered?: string;
  promptChars?: number;
  promptEstTokens?: number;
  tokenBudgetHint?: number;
  totalMs?: number;
  retrieveMs?: number;
  llmMs?: number;
  model?: string;
  provider?: string;
  temperature?: number;
  thinking?: string;
  inputTokens?: number;
  outputTokens?: number;
  usedVector: boolean;
};

export function emptyAskResult(question: string): AskResult {
  return {
    question,
    selectedNodes: [],
    edges: [],
    metadata: [],
    bm25: [],
    vector: [],
    graphMatches: [],
    fusion: [],
    citations: [],
    usedVector: false,
  };
}

export function applyStageEvent(prev: AskResult, event: StageEvent): AskResult {
  switch (event.stage) {
    case 'retrieval':
      return {
        ...prev,
        retrieveMs: event.ms,
        usedVector: event.usedVector,
        metadata: event.metadata,
        bm25: event.bm25,
        vector: event.vector,
        graphMatches: event.graph,
        fusion: event.fusion,
        selectedNodes: event.nodes,
      };
    case 'graph':
      return { ...prev, edges: event.edges };
    case 'ir':
      return {
        ...prev,
        intent: event.intent,
        confidence: event.confidence,
        confidenceLabel: event.confidenceLabel,
        tokenBudgetHint: event.tokenBudgetHint,
        citations: event.citations,
        irRaw: event.raw,
        knowledgeTrace: event.knowledgeTrace,
        isContinuation: event.isContinuation,
      };
    case 'prompt':
      return {
        ...prev,
        promptSystem: event.system,
        promptUser: event.user,
        promptRendered: event.rendered,
        promptChars: event.chars,
        promptEstTokens: event.estTokens,
      };
    case 'llm_start':
      return {
        ...prev,
        provider: event.provider,
        model: event.model,
        temperature: event.temperature,
        thinking: event.thinking,
      };
    case 'answer':
      return {
        ...prev,
        answer: event.answer,
        llmMs: event.llmMs,
        totalMs: event.totalMs,
        provider: event.provider,
        model: event.model,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
      };
    case 'error':
      return prev;
  }
}
