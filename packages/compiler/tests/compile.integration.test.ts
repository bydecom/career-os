import { describe, it, expect, afterAll } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rmSync } from 'fs';
import { compile } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = resolve(__dirname, 'fixtures');
const outputDir = resolve(__dirname, '.tmp-output');

afterAll(() => {
  rmSync(outputDir, { recursive: true, force: true });
});

describe('compile (end-to-end pipeline)', () => {
  it('compiles fixture nodes into a graph with cross-node edges', async () => {
    const result = await compile({ sourceDir, outputDir });

    const compiledIds = result.graph.nodes.map((n) => n.id);
    expect(compiledIds).toContain('fixture-tech');
    expect(compiledIds).toContain('fixture-project');

    // fixture-tech <-> fixture-project reference each other via wiki-links
    expect(result.graph.edges.length).toBeGreaterThanOrEqual(2);
  });

  it('reports a SCHEMA_VALIDATION_ERROR and skips the invalid node instead of crashing', async () => {
    const result = await compile({ sourceDir, outputDir });

    const compiledIds = result.graph.nodes.map((n) => n.id);
    expect(compiledIds).not.toContain('fixture-bad-experience');

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'SCHEMA_VALIDATION_ERROR' })
    );
  });

  it('still compiles a node with no frontmatter, but reports its schema errors', async () => {
    const result = await compile({ sourceDir, outputDir });

    // no-frontmatter.md has an empty frontmatter object, missing id/type/name
    const errors = result.diagnostics.filter((d) => d.code === 'SCHEMA_VALIDATION_ERROR');
    expect(errors.length).toBeGreaterThan(0);
  });
});
