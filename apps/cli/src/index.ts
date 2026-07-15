#!/usr/bin/env node
/**
 * CareerOS CLI
 * Usage:
 *   career compile | validate | query | ask | …
 *
 * TODO(#6): CLI currently orchestrates retrieve → ConversationIR → verbalize
 * inline in runAsk(). Acceptable for v1. Extract shared runtime orchestration
 * when career resume / career portfolio need the same pipeline.
 */

import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { compile } from '@career-os/compiler';
import { loadGraph, Retriever, QdrantVectorIndex } from '@career-os/retriever';
import type { KnowledgeGraph } from '@career-os/ontology';
import { GeminiEmbedder } from '@career-os/embedding';
import { GraphStore } from '@career-os/graph-store';
import { applyBudget, buildConversationIR, promptRenderer } from '@career-os/conversation';
import { createProvider, verbalize } from '@career-os/llm';
import { projectResume, renderMarkdown, formatDiagnostics } from '@career-os/resume';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../../..');

try {
  process.loadEnvFile(resolve(ROOT, '.env'));
} catch {
  // .env is optional — required for `career ask` and `career query --vector`.
}

function parseQuestionArgs(): { query: string; useVector: boolean; topK: number } {
  const knownFlags = new Set(['--source', '--output', '--topk']);
  const useVector = args.includes('--vector');
  const queryTokens: string[] = [];
  for (let i = 1; i < args.length; i++) {
    const token = args[i]!;
    if (token.startsWith('--') || token === '-v') {
      if (knownFlags.has(token)) i++;
      continue;
    }
    queryTokens.push(token);
  }
  return {
    query: queryTokens.join(' '),
    useVector,
    topK: Number(getArg('--topk', '10')),
  };
}

function loadCompiledGraph(): KnowledgeGraph {
  const dbPath = resolve(outputDir, 'graph.db');
  const graphJsonPath = resolve(outputDir, 'graph.json');
  try {
    if (existsSync(dbPath)) {
      const store = new GraphStore(dbPath);
      const graph = store.readAll();
      store.close();
      return graph;
    }
    return loadGraph(graphJsonPath);
  } catch {
    console.error(`Could not read the compiled graph from ${outputDir}. Run "career compile" first.`);
    process.exit(1);
    throw new Error('unreachable');
  }
}

function appendJsonl(fileName: string, record: Record<string, unknown>): void {
  mkdirSync(outputDir, { recursive: true });
  appendFileSync(resolve(outputDir, fileName), `${JSON.stringify(record)}\n`, 'utf-8');
}

// ---------------------------------------------------------------------------
// Argument Parsing (no dependencies — keep CLI zero-dep)
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const command = args[0];

function getArg(flag: string, defaultValue: string): string {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1]! : defaultValue;
}

const sourceDir = getArg('--source', resolve(ROOT, 'career-data/nodes'));
const outputDir = getArg('--output', resolve(ROOT, 'career-data/generated'));
const verbose = args.includes('--verbose') || args.includes('-v');

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------
async function runCompile() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   CareerOS Compiler — v1.0               ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  Source : ${sourceDir}`);
  console.log(`  Output : ${outputDir}`);
  console.log('');

  const result = await compile({ sourceDir, outputDir, verbose });

  // Persist the compiled graph to SQLite alongside graph.json. The Compiler
  // is the only writer of this DB (per the "Read-Only by Default" API
  // principle) — every compile fully replaces it inside a transaction.
  const store = new GraphStore(resolve(outputDir, 'graph.db'));
  store.write(result.graph);
  store.close();

  const errors   = result.diagnostics.filter((d) => d.level === 'error');
  const warnings = result.diagnostics.filter((d) => d.level === 'warning');
  const infos    = result.diagnostics.filter((d) => d.level === 'info');

  console.log('─────────────────────────────────────────────');
  console.log(`  ✅ Nodes compiled : ${result.statistics.totalNodes}`);
  console.log(`  🔗 Edges derived  : ${result.statistics.totalEdges}`);
  console.log(`  ⏱  Parse time     : ${result.statistics.parseTimeMs}ms`);
  console.log('─────────────────────────────────────────────');

  if (errors.length > 0) {
    console.log(`\n  ❌ Errors   : ${errors.length}`);
    for (const e of errors) {
      const loc = e.source ? ` (${e.source.filePath}:${e.source.lineStart})` : '';
      console.log(`     [${e.code}]${loc} ${e.message}`);
    }
  }
  if (warnings.length > 0) {
    console.log(`\n  ⚠️  Warnings : ${warnings.length}`);
    for (const w of warnings) {
      const loc = w.source ? ` (${w.source.filePath}:${w.source.lineStart})` : '';
      console.log(`     [${w.code}]${loc} ${w.message}`);
    }
  }
  if (verbose && infos.length > 0) {
    console.log(`\n  ℹ️  Info     : ${infos.length}`);
    for (const i of infos) {
      console.log(`     [${i.code}] ${i.message}`);
    }
  }

  console.log('');
  console.log(`  Output written to: ${outputDir}`);
  console.log('    → graph.json');
  console.log('    → graph.db (SQLite)');
  console.log('    → diagnostics.json');
  console.log('    → stats.json');
  console.log('');

  if (errors.length > 0) process.exit(1);
}

async function runValidate() {
  console.log('Running validation only (no graph output)...\n');
  const result = await compile({
    sourceDir,
    outputDir: resolve(ROOT, '.cache/validate'),
    verbose: true,
  });

  const errors = result.diagnostics.filter((d) => d.level === 'error');
  console.log(errors.length === 0
    ? '✅ All nodes passed validation.'
    : `❌ ${errors.length} error(s) found.`
  );
  if (errors.length > 0) process.exit(1);
}

async function runQuery() {
  const { query, useVector, topK } = parseQuestionArgs();
  if (!query) {
    console.error('Usage: career query "<your question>" [--topk <n>] [--vector]');
    process.exit(1);
  }

  const graph = loadCompiledGraph();
  const retriever = new Retriever(graph);

  let results;
  if (useVector) {
    const { QDRANT_URL, QDRANT_API_KEY, GEMINI_API_KEY } = process.env;
    if (!QDRANT_URL || !GEMINI_API_KEY) {
      console.error('--vector requires QDRANT_URL and GEMINI_API_KEY in .env (see .env.example).');
      process.exit(1);
      return;
    }
    const embedder = new GeminiEmbedder({ apiKey: GEMINI_API_KEY });
    const vectorIndex = new QdrantVectorIndex({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY || undefined,
      collection: 'career-nodes',
      vectorSize: 768,
    });
    results = (await retriever.retrieveHybrid(query, embedder, vectorIndex, { topK })).results;
  } else {
    results = retriever.retrieve(query, { topK }).results;
  }

  console.log('');
  console.log(`Query: "${query}"`);
  console.log('─────────────────────────────────────────────');

  if (results.length === 0) {
    console.log('No matching knowledge found.');
  }

  results.forEach((result, index) => {
    console.log(`${index + 1}. [${result.node.type}] ${result.node.name} (${result.node.id})`);
    console.log(`   score: ${result.explanation.score.toFixed(4)}`);
    for (const reason of result.explanation.reasons) {
      console.log(`   - ${reason}`);
    }
  });
  console.log('');
}

async function runAsk() {
  const { query, useVector, topK } = parseQuestionArgs();
  if (!query) {
    console.error('Usage: career ask "<your question>" [--topk <n>] [--vector]');
    process.exit(1);
  }

  const { GEMINI_API_KEY } = process.env;
  if (!GEMINI_API_KEY) {
    console.error('career ask requires GEMINI_API_KEY in .env (see .env.example).');
    process.exit(1);
  }

  const graph = loadCompiledGraph();
  const retriever = new Retriever(graph);

  const retrieveStarted = Date.now();
  let outcome;
  if (useVector) {
    const { QDRANT_URL, QDRANT_API_KEY } = process.env;
    if (!QDRANT_URL) {
      console.error('--vector requires QDRANT_URL in .env (see .env.example).');
      process.exit(1);
      return;
    }
    const embedder = new GeminiEmbedder({ apiKey: GEMINI_API_KEY });
    const vectorIndex = new QdrantVectorIndex({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY || undefined,
      collection: 'career-nodes',
      vectorSize: 768,
    });
    outcome = await retriever.retrieveHybrid(query, embedder, vectorIndex, { topK });
  } else {
    outcome = retriever.retrieve(query, { topK });
  }
  const retrieveLatencyMs = Date.now() - retrieveStarted;

  const ir = applyBudget(buildConversationIR(query, outcome.results, graph, { topK }), {
    topK: Math.min(topK, 8),
  });

  appendJsonl('query-logs.jsonl', {
    ts: new Date().toISOString(),
    query,
    retrieval: outcome.retrieval,
    selectedNodeIds: ir.candidateNodes.map((n) => n.id),
    confidence: ir.confidence,
    latencyMs: retrieveLatencyMs,
  });

  console.log('');
  console.log(promptRenderer.toReasoning(ir));
  console.log('');
  console.log('Answer');
  console.log('──────');

  const provider = createProvider({ provider: 'gemini', apiKey: GEMINI_API_KEY });
  const llmStarted = Date.now();
  process.stdout.write(''); // ensure Answer header flushed before stream
  const verbalized = await verbalize(ir, provider, {
    temperature: 0.2,
    thinking: 'minimal',
    stream: true,
    onDelta: (text) => process.stdout.write(text),
  });
  const llmLatencyMs = Date.now() - llmStarted;

  process.stdout.write('\n\n');

  const promptMarkdown = promptRenderer.toMarkdown(ir);
  appendJsonl('conversation-logs.jsonl', {
    ts: new Date().toISOString(),
    query,
    contextSize: ir.tokenBudgetHint,
    promptChars: promptMarkdown.length,
    responseChars: verbalized.answer.length,
    inputTokens: verbalized.usage?.inputTokens,
    outputTokens: verbalized.usage?.outputTokens,
    totalTokens: verbalized.usage?.totalTokens,
    confidence: ir.confidence,
    latencyMs: llmLatencyMs,
    provider: verbalized.provider,
    model: verbalized.model,
  });
}

async function runResume() {
  const graph = loadCompiledGraph();
  let result;
  try {
    result = projectResume(graph, { scope: 'master' });
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
    return;
  }

  const markdown = renderMarkdown(result.ir);
  mkdirSync(outputDir, { recursive: true });
  const mdPath = resolve(outputDir, 'resume.md');
  const irPath = resolve(outputDir, 'resume.ir.json');
  writeFileSync(mdPath, markdown, 'utf-8');
  writeFileSync(irPath, `${JSON.stringify(result.ir, null, 2)}\n`, 'utf-8');

  console.log('');
  console.log('CareerOS Resume — master projection');
  console.log('────────────────────────────────────');
  console.log(formatDiagnostics(result.diagnostics));
  console.log('');
  console.log(`Written: ${mdPath}`);
  console.log(`         ${irPath}`);
  console.log('');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
switch (command) {
  case 'compile':
    await runCompile();
    break;
  case 'validate':
    await runValidate();
    break;
  case 'query':
    await runQuery();
    break;
  case 'ask':
    await runAsk();
    break;
  case 'resume':
    await runResume();
    break;
  default:
    console.log(`
CareerOS CLI

Commands:
  compile   Compile knowledge nodes → Knowledge Graph
  validate  Validate knowledge nodes without writing output
  query     Developer command — Hybrid Retrieval debug (no LLM)
  ask       User-facing — retrieve → ConversationIR → LLM verbalize
  resume    Master resume projection → Markdown (no Retriever / LLM)

Options:
  --source <dir>   Source directory (default: career-data/nodes)
  --output <dir>   Output directory (default: career-data/generated)
  --topk <n>       Max retrieval results (default: 10)
  --vector         Include Vector Search (requires Qdrant + GEMINI_API_KEY)
  --verbose, -v    Print all diagnostics including info-level
    `);
}

