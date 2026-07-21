#!/usr/bin/env node
/**
 * Retrieval Benchmark — Precision@K / Recall@K over tests/golden/retrieval-cases.json
 *
 * Usage:
 *   node scripts/benchmark-retrieval.mjs [--k 5] [--vector]
 *
 * Requires the graph to be compiled first (`npm run compile`) and the
 * retriever package built (`npm run build:retriever`).
 *
 * --vector additionally exercises Vector Search (ADR-0005) and requires
 * Qdrant + GEMINI_API_KEY to be configured (see .env.example). Without it,
 * the benchmark only exercises the deterministic Metadata+Graph+BM25 path.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { loadGraph, Retriever, QdrantVectorIndex } from '@career-os/retriever';
import { GraphStore } from '@career-os/graph-store';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

try {
  process.loadEnvFile(resolve(ROOT, '.env'));
} catch {
  // .env is optional unless --vector is passed.
}

const args = process.argv.slice(2);
const kIdx = args.indexOf('--k');
const K = kIdx >= 0 && args[kIdx + 1] ? Number(args[kIdx + 1]) : 5;
const useVector = args.includes('--vector');

const dbPath = resolve(ROOT, 'career-data/generated/graph.db');
const graph = existsSync(dbPath)
  ? (() => {
      const store = new GraphStore(dbPath);
      const g = store.readAll();
      store.close();
      return g;
    })()
  : loadGraph(resolve(ROOT, 'career-data/generated/graph.json'));

const retriever = new Retriever(graph);

let embedder;
let vectorIndex;
if (useVector) {
  const { QDRANT_URL, QDRANT_API_KEY, GEMINI_API_KEY } = process.env;
  if (!QDRANT_URL || !GEMINI_API_KEY) {
    console.error('--vector requires QDRANT_URL and GEMINI_API_KEY in .env (see .env.example).');
    process.exit(1);
  }
  const { GeminiEmbedder } = await import('@career-os/embedding');
  embedder = new GeminiEmbedder({ apiKey: GEMINI_API_KEY });
  vectorIndex = new QdrantVectorIndex({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY || undefined,
    collection: 'career-nodes',
    vectorSize: 768,
  });
}

const casesPath = resolve(ROOT, 'tests/golden/retrieval-cases.json');
const cases = JSON.parse(readFileSync(casesPath, 'utf-8'));

console.log('');
console.log(`Retrieval Benchmark — K = ${K}${useVector ? ' (with Vector Search)' : ''}`);
console.log(`Cases: ${cases.length}`);
console.log('─────────────────────────────────────────────────────────────');

let totalPrecision = 0;
let totalRecall = 0;

for (const testCase of cases) {
  const retrieveOpts = {
    topK: K,
    ...(testCase.carryOverNodeIds ? { carryOverNodeIds: testCase.carryOverNodeIds } : {}),
  };
  const results = useVector
    ? (await retriever.retrieveHybrid(testCase.query, embedder, vectorIndex, retrieveOpts)).results
    : retriever.retrieve(testCase.query, retrieveOpts).results;
  const retrievedIds = results.map((r) => r.node.id);
  const relevantSet = new Set(testCase.relevantNodeIds);

  const truePositives = retrievedIds.filter((id) => relevantSet.has(id)).length;
  const precision = retrievedIds.length > 0 ? truePositives / retrievedIds.length : 0;
  const recall = relevantSet.size > 0 ? truePositives / relevantSet.size : 0;

  totalPrecision += precision;
  totalRecall += recall;

  const status = recall === 1 ? '✅' : recall > 0 ? '⚠️ ' : '❌';
  console.log(`${status} [${testCase.id}] P@${K}=${precision.toFixed(2)} R@${K}=${recall.toFixed(2)}`);
  console.log(`   query: "${testCase.query}"`);
  console.log(`   expected: [${testCase.relevantNodeIds.join(', ')}]`);
  console.log(`   got:      [${retrievedIds.join(', ')}]`);
}

const avgPrecision = totalPrecision / cases.length;
const avgRecall = totalRecall / cases.length;

console.log('─────────────────────────────────────────────────────────────');
console.log(`Average Precision@${K}: ${avgPrecision.toFixed(4)}`);
console.log(`Average Recall@${K}:    ${avgRecall.toFixed(4)}`);
console.log('');
