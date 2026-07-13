const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.github', '.gemini',
  'dist', 'build', 'out', '.next', '.cache'
]);

const EXPECTED_DIRS = [
  'apps/web', 'apps/api', 'apps/cli', 'apps/mcp',

  'career-data/nodes/technology',
  'career-data/nodes/project',
  'career-data/nodes/experience',
  'career-data/nodes/company',
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
  'knowledge/career-os',

  'docs/00-vision', 'docs/01-adr', 'docs/02-architecture',
  'docs/03-guides', 'docs/04-spec', 'docs/05-internals',
  'docs/06-api-reference', 'docs/07-contributing',
  'docs/references', 'docs/assets',

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

  'services/graph-engine', 'services/retriever',
  'services/embedding', 'services/llm', 'services/sync',

  'labs/benchmark', 'labs/prototype/graph-rag-v1',
  'labs/prototype/graph-rag-v2', 'labs/prototype/metadata-first',
  'labs/experiments', 'labs/evaluation', 'labs/prompt', 'labs/papers',

  'templates/node', 'templates/resume', 'templates/cover-letter', 'templates/portfolio',
  'output',
  'tests/fixtures', 'tests/integration', 'tests/e2e', 'tests/benchmark', 'tests/golden',
  'examples/minimal', 'examples/career-demo',
  'examples/enterprise-demo', 'examples/academic-demo',
];

function generateTree(dir, prefix = '') {
  let entries;
  try { entries = fs.readdirSync(dir); } catch (e) { return; }

  const dirs = entries.filter(f => {
    if (EXCLUDE_DIRS.has(f)) return false;
    try { return fs.statSync(path.join(dir, f)).isDirectory(); } catch (e) { return false; }
  });

  dirs.forEach((subDir, i) => {
    const isLast = i === dirs.length - 1;
    console.log(`${prefix}${isLast ? '└── ' : '├── '}${subDir}`);
    generateTree(path.join(dir, subDir), prefix + (isLast ? '    ' : '│   '));
  });
}

function checkStructure() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Career OS — Structure Check (V5)       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const missing = EXPECTED_DIRS.filter(dir => !fs.existsSync(path.join(rootDir, dir)));

  if (missing.length > 0) {
    console.log(`❌ ${missing.length} required ${missing.length === 1 ? 'directory' : 'directories'} missing:`);
    missing.forEach(m => console.log(`   - ${m}`));
    console.log('\nRun "npm run bootstrap" to generate them.\n');
  } else {
    console.log('✅ All required directories present!\n');
  }

  console.log('Directory Tree  (node_modules & .cache excluded):\n');
  console.log('career-os/');
  generateTree(rootDir);
}

checkStructure();
