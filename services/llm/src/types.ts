// ---------------------------------------------------------------------------
// Provider-agnostic LLM ports (Ports & Adapters).
// Business code depends on LlmProvider — never on Gemini/OpenAI SDKs.
//
// The provider is intentionally "dumb": it only sees system/user text and
 // returns text + usage. ConversationIR, evidence, and prompt templates live
// above this layer (packages/conversation + verbalize).
// ---------------------------------------------------------------------------

/** Reserved for future tool-calling; providers may ignore until wired. */
export interface ToolDefinition {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export type ThinkingLevel = 'none' | 'minimal' | 'medium' | 'high';

export type ToolChoice = 'auto' | 'required' | 'none';

export interface ChatRequest {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  /** Provider-agnostic thinking intensity — each adapter maps this itself. */
  thinking?: ThinkingLevel;
  tools?: ToolDefinition[];
  toolChoice?: ToolChoice;
}

/** Normalized usage across providers — never expose vendor field names. */
export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  provider: string;
  model: string;
}

export interface ChatResult {
  text: string;
  usage?: LlmUsage;
}

export type ChatStreamChunk =
  | { type: 'delta'; text: string }
  | { type: 'done'; usage?: LlmUsage };

/** Capability flags so CLI/UI can disable unsupported features. */
export interface LlmCapabilities {
  streaming: boolean;
  tools: boolean;
  thinking: boolean;
  vision: boolean;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  readonly capabilities: LlmCapabilities;
  complete(request: ChatRequest): Promise<ChatResult>;
  stream(request: ChatRequest): AsyncIterable<ChatStreamChunk>;
}

export interface VerbalizeResult {
  answer: string;
  provider: string;
  model: string;
  usage?: LlmUsage;
}

/** Prior turn for multi-turn verbalize / intent planner (not new facts). */
export interface RecentTurn {
  question: string;
  answer: string;
}

