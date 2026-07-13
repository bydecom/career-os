#!/usr/bin/env node
/**
 * Embeds every compiled node's text and upserts it into Qdrant.
 *
 * Requires:
 *   - `career-data/generated/graph.json` (run `npm run compile` first)
 *   - Qdrant running locally (`docker compose up -d qdrant`)
 *   - GEMINI_API_KEY, QDRANT_URL[, QDRANT_API_KEY] in .env (root)
 *
 * Usage:
 *   node scripts/index-embeddings.mjs
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadGraph, QdrantVectorIndex } from '@career-os/retriever';
import { GeminiEmbedder } from '@career-os/embedding';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

process.loadEnvFile(resolve(ROOT, '.env'));

const { QDRANT_URL, QDRANT_API_KEY, GEMINI_API_KEY } = process.env;
if (!QDRANT_URL) throw new Error('QDRANT_URL is not set (see .env.example).');
if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set (see .env.example).');

const COLLECTION = 'career-nodes';
const VECTOR_SIZE = 768; // text-embedding-004

const graph = loadGraph(resolve(ROOT, 'career-data/generated/graph.json'));
const embedder = new GeminiEmbedder({ apiKey: GEMINI_API_KEY });
const vectorIndex = new QdrantVectorIndex({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY || undefined,
  collection: COLLECTION,
  vectorSize: VECTOR_SIZE,
});

console.log(`Indexing ${graph.nodes.length} nodes into Qdrant collection "${COLLECTION}"...`);
await vectorIndex.ensureCollection();

function documentText(node) {
  const aliases = node.metadata.aliases ?? [];
  const tags = node.metadata.tags ?? [];
  return [node.name, ...aliases, ...tags, node.body.raw].join(' ');
}

const texts = graph.nodes.map(documentText);
const embeddings = await embedder.embedBatch(texts);

const points = graph.nodes.map((node, index) => ({
  id: index,
  nodeId: node.id,
  vector: embeddings[index].vector,
}));

await vectorIndex.upsert(points);

console.log(`Done. Indexed ${points.length} nodes.`);
