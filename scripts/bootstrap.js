const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

/**
 * Career OS — Canonical Directory Structure (V5)
 *
 * TWO knowledge systems, ONE compiler:
 *
 *   career-data/     → Career Knowledge: "What I've done" (Compiler input, recruiter-facing)
 *   knowledge/       → Second Brain: "What I know & how I think" (personal + publishable)
 *
 *   packages/        → Shared libraries (compiler, ontology, graph, generator)
 *   services/        → Runtime services (retriever, embedding, llm)
 *   apps/            → Consumer applications (web, api, cli, mcp)
 *   docs/            → Project documentation (ADR, architecture, guides, spec)
 *   labs/            → Research, prototypes, benchmarks
 *   templates/       → Authoring tooling
 *   output/          → Build artifacts (git-ignored)
 *   tests/           → Test suites including golden tests
 *   examples/        → Open-source demo setups
 */
const directories = [

  // ─────────────── Apps ───────────────
  'apps/web',
  'apps/api',
  'apps/cli',
  'apps/mcp',

  // ─────────────── Career Data (Compiler SSOT) ───────────────
  'career-data/nodes/technology',
  'career-data/nodes/project',
  'career-data/nodes/experience',
  'career-data/nodes/company',
  'career-data/nodes/profile',
  'career-data/nodes/decision',
  'career-data/nodes/achievement',
  'career-data/nodes/concept',
  'career-data/career',
  'career-data/assets/architecture',
  'career-data/assets/benchmark',
  'career-data/assets/diagram',
  'career-data/assets/screenshots',
  'career-data/assets/avatars',
  'career-data/assets/certificates',
  'career-data/generated/graph',
  'career-data/generated/embeddings',
  'career-data/generated/resume',
  'career-data/generated/portfolio',
  'career-data/generated/citations',
  'career-data/generated/json',

  // ─────────────── Second Brain (Personal Knowledge) ───────────────
  'knowledge/software-engineering',
  'knowledge/distributed-systems',
  'knowledge/ai',
  'knowledge/computer-science',
  'knowledge/system-design',
  'knowledge/database',
  'knowledge/architecture',
  'knowledge/career',
  'knowledge/product',
  'knowledge/leadership',
  'knowledge/psychology',
  'knowledge/communication',
  'knowledge/business',
  'knowledge/research',
  'knowledge/books',
  'knowledge/papers',
  'knowledge/courses',
  'knowledge/career-os',    // Decisions about this project itself

  // ─────────────── Documentation ───────────────
  'docs/00-vision',
  'docs/01-adr',
  'docs/02-architecture',
  'docs/03-guides',
  'docs/04-spec',
  'docs/05-internals',
  'docs/06-api-reference',
  'docs/07-contributing',
  'docs/references',
  'docs/assets',

  // ─────────────── Packages ───────────────
  'packages/compiler/src/lexer',
  'packages/compiler/src/parser',
  'packages/compiler/src/validator',
  'packages/compiler/src/builder',
  'packages/compiler/src/indexer',
  'packages/compiler/src/watcher',
  'packages/ontology/src',
  'packages/graph/src',
  'packages/generator/src',
  'packages/sdk/src',
  'packages/shared/src',
  'packages/ui/src',

  // ─────────────── Services (Runtime only) ───────────────
  'services/graph-engine',
  'services/retriever',
  'services/embedding',
  'services/llm',
  'services/sync',

  // ─────────────── Labs ───────────────
  'labs/benchmark',
  'labs/prototype/graph-rag-v1',
  'labs/prototype/graph-rag-v2',
  'labs/prototype/metadata-first',
  'labs/experiments',
  'labs/evaluation',
  'labs/prompt',
  'labs/papers',

  // ─────────────── Templates ───────────────
  'templates/node',
  'templates/resume',
  'templates/cover-letter',
  'templates/portfolio',

  // ─────────────── Output ───────────────
  'output',

  // ─────────────── Tests ───────────────
  'tests/fixtures',
  'tests/integration',
  'tests/e2e',
  'tests/benchmark',
  'tests/golden',

  // ─────────────── Examples ───────────────
  'examples/minimal',
  'examples/career-demo',
  'examples/enterprise-demo',
  'examples/academic-demo',
];

function bootstrap() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Career OS — Bootstrap (V5)             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  let createdCount = 0;
  directories.forEach(dir => {
    const targetPath = path.join(rootDir, dir);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      console.log(`  [CREATED] ${dir}`);
      createdCount++;
    } else {
      console.log(`  [EXISTS]  ${dir}`);
    }
  });

  console.log(`\nBootstrap complete. ${createdCount} new ${createdCount === 1 ? 'directory' : 'directories'} created.`);
}

bootstrap();
