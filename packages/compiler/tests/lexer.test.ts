import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { lexFile } from '../src/lexer/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => resolve(__dirname, 'fixtures', name);

describe('lexFile', () => {
  it('splits frontmatter from body and parses YAML', () => {
    const result = lexFile(fixture('valid-technology.md'));

    expect(result.id).toBe('valid-technology');
    expect(result.frontmatter.id).toBe('fixture-tech');
    expect(result.frontmatter.type).toBe('technology');
    expect(result.frontmatter.aliases).toEqual(['fixture-alias']);
    expect(result.rawBody).toContain('## Problem');
    expect(result.rawBody).not.toContain('---');
  });

  it('derives the node id from the filename, not the frontmatter', () => {
    const result = lexFile(fixture('valid-technology.md'));
    // id here is the raw filename-derived id; the compiler later prefers
    // frontmatter.id if present — the Lexer itself must stay dumb.
    expect(result.id).toBe('valid-technology');
  });

  it('computes bodyStartLine correctly to keep diagnostics line-accurate', () => {
    const result = lexFile(fixture('valid-technology.md'));
    // 17 lines of frontmatter incl. delimiters -> body starts after that
    const bodyFirstLine = result.rawBody.split('\n')[0];
    expect(bodyFirstLine).toBe('');
    expect(result.bodyStartLine).toBeGreaterThan(1);
  });

  it('falls back gracefully when there is no frontmatter block', () => {
    const result = lexFile(fixture('no-frontmatter.md'));

    expect(result.frontmatter).toEqual({});
    expect(result.rawFrontmatter).toBe('');
    expect(result.bodyStartLine).toBe(1);
    expect(result.rawBody).toContain('# No Frontmatter');
  });
});
