import { resolve } from 'path';
import { existsSync } from 'fs';
import { loadGraph, Retriever, QdrantVectorIndex } from '@career-os/retriever';
import { GeminiEmbedder } from '@career-os/embedding';
import { applyBudget, buildConversationIR, buildKnowledgeTrace, formatConfidenceLabel, promptRenderer } from '@career-os/conversation';
import { createProvider, verbalize, VERBALIZE_SYSTEM_PROMPT } from '@career-os/llm';
import type { KnowledgeGraph, KnowledgeNode } from '@career-os/ontology';
import type { EngineMatch, FusedMatch, StageEvent } from './askTypes';

const ROOT = resolve(process.cwd(), '../..');
const GRAPH_PATH = resolve(ROOT, 'career-data/generated/graph.json');

function ensureEnv(): void {
  try {
    process.loadEnvFile(resolve(ROOT, '.env'));
  } catch {
    // optional — keys may already be in process.env
  }
}

function inferIntent(question: string): string {
  const q = question.toLowerCase();
  if (/hallucin|evidence|invent|fake|true/.test(q)) return 'Evidence / Certainty';
  if (/architect|how does|pipeline|compile|ir\b/.test(q)) return 'Architecture Explanation';
  if (/compare|vs|versus|difference/.test(q)) return 'Comparison';
  if (/skill|tech|stack|typescript|python|redis/.test(q)) return 'Skill Deep-dive';
  return 'Project Explanation';
}

function nodeLookup(graph: KnowledgeGraph): (id: string) => KnowledgeNode<any> | undefined {
  const map = new Map(graph.nodes.map((n) => [n.id, n]));
  return (id) => map.get(id);
}

/**
 * Runs the real retrieve → ConversationIR → prompt → LLM pipeline, emitting a
 * StageEvent as each stage completes so the caller can stream progress live
 * instead of waiting for the whole pipeline to finish. Every field emitted is
 * real data produced by the pipeline — no simulated "thinking" text.
 */
export async function askCareerStream(
  question: string,
  emit: (event: StageEvent) => void,
): Promise<void> {
  ensureEnv();

  const q = question.trim();
  if (!q) throw new Error('Question is required.');
  if (q.length > 1000) throw new Error('Question is too long (max 1000 chars).');

  const { GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY } = process.env;
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to the repo root .env');
  }
  if (!existsSync(GRAPH_PATH)) {
    throw new Error('graph.json missing. Run: npm run compile');
  }

  const started = Date.now();
  const graph = loadGraph(GRAPH_PATH);
  const lookup = nodeLookup(graph);
  const nameOf = (id: string) => lookup(id)?.name ?? id;
  const typeOf = (id: string) => String(lookup(id)?.type ?? 'unknown');

  const retriever = new Retriever(graph);
  const topK = 10;
  let usedVector = Boolean(QDRANT_URL);

  const retrieveStarted = Date.now();
  let outcome;
  if (usedVector) {
    try {
      const embedder = new GeminiEmbedder({ apiKey: GEMINI_API_KEY });
      const vectorIndex = new QdrantVectorIndex({
        url: QDRANT_URL!,
        apiKey: QDRANT_API_KEY || undefined,
        collection: 'career-nodes',
        vectorSize: 768,
      });
      outcome = await retriever.retrieveHybrid(q, embedder, vectorIndex, { topK });
    } catch {
      // Qdrant/embed unreachable — degrade to lexical so Interview still answers.
      usedVector = false;
      outcome = retriever.retrieve(q, { topK });
    }
  } else {
    outcome = retriever.retrieve(q, { topK });
  }
  const retrieveLatencyMs = Date.now() - retrieveStarted;

  const ir = applyBudget(buildConversationIR(q, outcome.results, graph, { topK }), {
    topK: Math.min(topK, 8),
  });
  const knowledgeTrace = buildKnowledgeTrace(ir.candidateNodes, ir.anchorNodes);

  const metadataMatches: EngineMatch[] = outcome.retrieval.metadata.map((m) => ({
    nodeId: m.nodeId,
    name: nameOf(m.nodeId),
    type: typeOf(m.nodeId),
    matchedTerm: m.matchedTerm,
    matchedField: m.matchedField,
  }));
  const bm25Matches: EngineMatch[] = outcome.retrieval.bm25.map((m) => ({
    nodeId: m.nodeId,
    name: nameOf(m.nodeId),
    type: typeOf(m.nodeId),
    score: m.score,
  }));
  const vectorMatches: EngineMatch[] = outcome.retrieval.vector.map((m) => ({
    nodeId: m.nodeId,
    name: nameOf(m.nodeId),
    type: typeOf(m.nodeId),
    score: m.score,
  }));
  const graphMatches: EngineMatch[] = outcome.retrieval.graph.map((m) => ({
    nodeId: m.nodeId,
    name: nameOf(m.nodeId),
    type: typeOf(m.nodeId),
    score: m.score,
  }));

  const selectedIds = new Set(ir.candidateNodes.map((n) => n.id));
  const fusion: FusedMatch[] = outcome.results.map((r, index) => ({
    nodeId: r.node.id,
    name: r.node.name,
    type: String(r.node.type),
    score: r.explanation.score,
    engines: r.explanation.engines,
    selected: selectedIds.has(r.node.id) && index < topK,
  }));

  emit({
    stage: 'retrieval',
    ms: retrieveLatencyMs,
    usedVector,
    metadata: metadataMatches,
    bm25: bm25Matches,
    vector: vectorMatches,
    graph: graphMatches,
    fusion,
    nodes: ir.candidateNodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: String(n.type),
      score: n.score,
      engines: n.engines,
      excerpt: n.excerpt.slice(0, 160),
    })),
  });

  emit({
    stage: 'graph',
    edges: ir.edges.slice(0, 12).map((e) => ({ source: e.source, target: e.target, type: e.type })),
  });

  emit({
    stage: 'ir',
    intent: inferIntent(q),
    confidence: ir.confidence,
    confidenceLabel: formatConfidenceLabel(ir.confidence),
    tokenBudgetHint: ir.tokenBudgetHint,
    citations: ir.candidateNodes.slice(0, 6).map((n) => `${n.type}.${n.id}`),
    raw: ir,
    knowledgeTrace,
  });

  const packageMarkdown = promptRenderer.toMarkdown(ir);
  const confidenceLabel = formatConfidenceLabel(ir.confidence);
  const userPrompt = [
    `Retrieval Confidence: ${confidenceLabel} (${ir.confidence.toFixed(2)})`,
    ``,
    `Question: ${ir.question}`,
    ``,
    `Verbalize the following ConversationIR. Do not add facts that are not present.`,
    ``,
    packageMarkdown,
  ].join('\n');

  emit({
    stage: 'prompt',
    system: VERBALIZE_SYSTEM_PROMPT,
    user: userPrompt,
    rendered: packageMarkdown,
    chars: userPrompt.length,
    estTokens: Math.round(userPrompt.length / 4),
  });

  const provider = createProvider({ provider: 'gemini', apiKey: GEMINI_API_KEY });
  const temperature = 0.2;
  const thinking = 'minimal';
  emit({ stage: 'llm_start', provider: provider.name, model: provider.model, temperature, thinking });

  const llmStarted = Date.now();
  let verbalized;
  try {
    verbalized = await verbalize(ir, provider, { temperature, thinking });
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'LLM request failed';
    throw new Error(
      raw === 'fetch failed'
        ? 'Gemini API unreachable (network/fetch failed). Check GEMINI_API_KEY and connectivity.'
        : raw,
    );
  }
  const llmLatencyMs = Date.now() - llmStarted;

  emit({
    stage: 'answer',
    answer: verbalized.answer,
    llmMs: llmLatencyMs,
    totalMs: Date.now() - started,
    provider: verbalized.provider,
    model: verbalized.model,
    inputTokens: verbalized.usage?.inputTokens,
    outputTokens: verbalized.usage?.outputTokens,
  });
}
