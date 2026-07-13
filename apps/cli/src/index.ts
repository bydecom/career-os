#!/usr/bin/env node
/**
 * CareerOS CLI
 * Usage:
 *   node apps/cli/src/index.js compile [--source <dir>] [--output <dir>] [--verbose]
 *   node apps/cli/src/index.js validate [--source <dir>]
 */

import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { compile } from '@career-os/compiler';
import { loadGraph, Retriever, QdrantVectorIndex } from '@career-os/retriever';
import { GeminiEmbedder } from '@career-os/embedding';
import { GraphStore } from '@career-os/graph-store';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../../..');

try {
  process.loadEnvFile(resolve(ROOT, '.env'));
} catch {
  // .env is optional — only required for `career query --vector`.
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
  const knownFlags = new Set(['--source', '--output', '--topk']);
  const useVector = args.includes('--vector');
  const queryTokens: string[] = [];
  for (let i = 1; i < args.length; i++) {
    const token = args[i]!;
    if (token.startsWith('--') || token === '-v') {
      if (knownFlags.has(token)) i++; // skip this flag's value too
      continue;
    }
    queryTokens.push(token);
  }
  const query = queryTokens.join(' ');
  if (!query) {
    console.error('Usage: career query "<your question>" [--topk <n>] [--vector]');
    process.exit(1);
  }

  const topK = Number(getArg('--topk', '10'));
  const dbPath = resolve(outputDir, 'graph.db');
  const graphJsonPath = resolve(outputDir, 'graph.json');

  let graph;
  try {
    if (existsSync(dbPath)) {
      const store = new GraphStore(dbPath);
      graph = store.readAll();
      store.close();
    } else {
      graph = loadGraph(graphJsonPath);
    }
  } catch {
    console.error(`Could not read the compiled graph from ${outputDir}. Run "career compile" first.`);
    process.exit(1);
    return;
  }

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
    results = await retriever.retrieveHybrid(query, embedder, vectorIndex, { topK });
  } else {
    results = retriever.retrieve(query, { topK });
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
  default:
    console.log(`
CareerOS CLI

Commands:
  compile   Compile knowledge nodes → Knowledge Graph
  validate  Validate knowledge nodes without writing output
  query     Run a Hybrid Retrieval query against the compiled graph

Options:
  --source <dir>   Source directory (default: career-data/nodes)
  --output <dir>   Output directory (default: career-data/generated)
  --topk <n>       Max results for "query" (default: 10)
  --vector         Include Vector Search (requires Qdrant + GEMINI_API_KEY)
  --verbose, -v    Print all diagnostics including info-level
    `);
}
