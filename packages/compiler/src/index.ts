import { glob } from 'glob';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { KnowledgeNode, CompileResult, CompilerDiagnostic } from '@career-os/ontology';
import { lexFile } from './lexer/index.js';
import { parseMarkdown } from './parser/index.js';
import { validateFrontmatter } from './validator/index.js';
import { buildGraph } from './builder/index.js';
import type { NodeWithLinks } from './builder/index.js';

// ---------------------------------------------------------------------------
// Compiler — The main entry point
// Orchestrates: Lexer → Parser → Validator → Builder → Emit
// ---------------------------------------------------------------------------

export interface CompilerOptions {
  /** Directory to scan for .md files (career-data/nodes/**) */
  sourceDir: string;
  /** Where to write graph.json output */
  outputDir: string;
  /** If true, print diagnostics even for info-level messages */
  verbose?: boolean;
}

/**
 * Compile all Markdown files in `sourceDir` into a KnowledgeGraph.
 * Emits graph.json + a diagnostics report to `outputDir`.
 *
 * @returns The CompileResult (graph + diagnostics + statistics)
 */
export async function compile(options: CompilerOptions): Promise<CompileResult> {
  const startTimeMs = Date.now();
  const { sourceDir, outputDir, verbose = false } = options;

  const diagnostics: CompilerDiagnostic[] = [];
  const nodeWithLinks: NodeWithLinks[] = [];

  // ------------------------------------------------------------------
  // Stage 1: Glob all .md files
  // ------------------------------------------------------------------
  const pattern = resolve(sourceDir, '**/*.md').replace(/\\/g, '/');
  const files = await glob(pattern);

  if (files.length === 0) {
    diagnostics.push({
      level: 'warning',
      code: 'NO_SOURCE_FILES',
      message: `No .md files found in ${sourceDir}`,
    });
  }

  // ------------------------------------------------------------------
  // Stage 2: Lex → Parse → Validate each file
  // ------------------------------------------------------------------
  for (const filePath of files) {
    try {
      // LEX
      const lexed = lexFile(filePath);

      // VALIDATE frontmatter
      const validation = validateFrontmatter(lexed.frontmatter, filePath);
      if (!validation.success) {
        for (const err of validation.errors) {
          diagnostics.push({
            level: 'error',
            code: 'SCHEMA_VALIDATION_ERROR',
            message: err,
            source: { filePath, lineStart: 1, lineEnd: lexed.bodyStartLine },
          });
        }
        continue; // Skip building a node for invalid files
      }

      // PARSE body
      const parsed = parseMarkdown(lexed);

      // BUILD node
      const metadata = validation.data;
      const node: KnowledgeNode<typeof metadata> = {
        id: metadata.id ?? lexed.id,
        type: metadata.type,
        name: metadata.name,
        metadata,
        body: parsed.parsedMarkdown,
        source: {
          filePath,
          lineStart: lexed.bodyStartLine,
          lineEnd: lexed.bodyStartLine + lexed.rawBody.split('\n').length - 1,
        },
      };

      nodeWithLinks.push({ node, wikiLinks: parsed.wikiLinks });
    } catch (err) {
      diagnostics.push({
        level: 'error',
        code: 'LEXER_ERROR',
        message: `Failed to process file ${filePath}: ${String(err)}`,
        source: { filePath, lineStart: 1, lineEnd: 1 },
      });
    }
  }

  // ------------------------------------------------------------------
  // Stage 3: Build Graph + Ontology Validation
  // ------------------------------------------------------------------
  const result = buildGraph(nodeWithLinks, startTimeMs);

  // Merge file-level diagnostics with graph-level diagnostics
  result.diagnostics.unshift(...diagnostics);

  // ------------------------------------------------------------------
  // Stage 4: Emit output files
  // ------------------------------------------------------------------
  mkdirSync(outputDir, { recursive: true });

  // graph.json
  writeFileSync(
    resolve(outputDir, 'graph.json'),
    JSON.stringify(
      {
        nodes: result.graph.nodes.map((n) => ({
          ...n,
          body: { raw: n.body.raw, sections: n.body.sections }, // omit heavy AST from JSON
        })),
        edges: result.graph.edges,
      },
      null,
      2
    ),
    'utf-8'
  );

  // diagnostics.json
  writeFileSync(
    resolve(outputDir, 'diagnostics.json'),
    JSON.stringify(result.diagnostics, null, 2),
    'utf-8'
  );

  // stats.json
  writeFileSync(
    resolve(outputDir, 'stats.json'),
    JSON.stringify(result.statistics, null, 2),
    'utf-8'
  );

  if (verbose) {
    for (const d of result.diagnostics) {
      const prefix = d.level === 'error' ? '❌' : d.level === 'warning' ? '⚠️ ' : 'ℹ️ ';
      console.log(`${prefix} [${d.code}] ${d.message}`);
    }
  }

  return result;
}

// Re-export pipeline stages for direct use
export { lexFile } from './lexer/index.js';
export { parseMarkdown } from './parser/index.js';
export { validateFrontmatter } from './validator/index.js';
export { validateOntology, inferEdgeType } from './validator/index.js';
export { buildGraph } from './builder/index.js';
