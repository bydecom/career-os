import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { lexFile } from '../src/lexer/index.js';
import { parseMarkdown } from '../src/parser/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => resolve(__dirname, 'fixtures', name);

describe('parseMarkdown', () => {
  it('extracts wiki-links with their target and section context', () => {
    const lexed = lexFile(fixture('valid-technology.md'));
    const { wikiLinks } = parseMarkdown(lexed);

    expect(wikiLinks).toHaveLength(2);
    expect(wikiLinks[0]).toMatchObject({
      raw: 'fixture-project',
      target: 'fixture-project',
      section: 'solution-/-concept',
    });
    expect(wikiLinks[1]).toMatchObject({
      target: 'fixture-project',
      section: 'used-in',
    });
  });

  it('supports [[target|display text]] syntax', () => {
    const lexed = {
      id: 'inline',
      filePath: 'inline.md',
      rawFrontmatter: '',
      frontmatter: {},
      rawBody: 'See [[some-node|a friendlier name]] for details.',
      bodyStartLine: 1,
    };
    const { wikiLinks } = parseMarkdown(lexed);

    expect(wikiLinks).toHaveLength(1);
    expect(wikiLinks[0]).toMatchObject({
      target: 'some-node',
      displayText: 'a friendlier name',
    });
  });

  it('normalizes targets to lowercase-hyphenated form', () => {
    const lexed = {
      id: 'inline',
      filePath: 'inline.md',
      rawFrontmatter: '',
      frontmatter: {},
      rawBody: 'Uses [[Some Node Name]].',
      bodyStartLine: 1,
    };
    const { wikiLinks } = parseMarkdown(lexed);

    expect(wikiLinks[0]?.target).toBe('some-node-name');
  });

  it('builds a hierarchical Section tree from headings', () => {
    const lexed = lexFile(fixture('valid-technology.md'));
    const { parsedMarkdown } = parseMarkdown(lexed);

    const titles = parsedMarkdown.sections.map((s) => s.title);
    expect(titles).toEqual(['Problem', 'Solution / Concept', 'Used In']);
  });

  it('extracts fenced code blocks with language tags', () => {
    const lexed = {
      id: 'inline',
      filePath: 'inline.md',
      rawFrontmatter: '',
      frontmatter: {},
      rawBody: '```ts\nconst x = 1;\n```\n',
      bodyStartLine: 1,
    };
    const { codeBlocks } = parseMarkdown(lexed);

    expect(codeBlocks).toEqual([{ lang: 'ts', value: 'const x = 1;' }]);
  });
});
