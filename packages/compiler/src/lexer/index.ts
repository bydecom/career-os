import { readFileSync } from 'fs';
import { basename, extname } from 'path';
import { parse as parseYaml } from 'yaml';

// ---------------------------------------------------------------------------
// Raw result of the Lexer pass
// The Lexer is dumb: it just reads bytes and splits YAML from Markdown.
// ---------------------------------------------------------------------------
export interface LexerOutput {
  /** Canonical ID derived from the filename (no extension) */
  id: string;
  /** Absolute path to the source file */
  filePath: string;
  /** Raw YAML front-matter string (may be empty) */
  rawFrontmatter: string;
  /** Parsed frontmatter as a plain object (unvalidated) */
  frontmatter: Record<string, unknown>;
  /** Raw Markdown body (everything after the closing ---) */
  rawBody: string;
  /** Line number where the body starts (for SourceLocation) */
  bodyStartLine: number;
}

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Lex a single Markdown file.
 * Splits YAML front-matter from the body. Does NOT validate either.
 */
export function lexFile(filePath: string): LexerOutput {
  const raw = readFileSync(filePath, 'utf-8');
  const id = basename(filePath, extname(filePath));

  const match = FRONTMATTER_REGEX.exec(raw);
  if (!match) {
    return {
      id,
      filePath,
      rawFrontmatter: '',
      frontmatter: {},
      rawBody: raw,
      bodyStartLine: 1,
    };
  }

  const rawFrontmatter = match[1] ?? '';
  const frontmatter = parseYaml(rawFrontmatter) as Record<string, unknown> ?? {};
  const rawBody = raw.slice(match[0].length);
  // Count lines in the matched frontmatter block (+2 for opening/closing ---)
  const bodyStartLine = (match[0].match(/\n/g)?.length ?? 0) + 1;

  return { id, filePath, rawFrontmatter, frontmatter, rawBody, bodyStartLine };
}
