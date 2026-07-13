import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root, Heading, Text, Link } from 'mdast';
import type { LexerOutput } from '../lexer/index.js';
import type { ParsedMarkdown, Section } from '@career-os/ontology';

// ---------------------------------------------------------------------------
// Wiki-link Extraction
// Wiki-links have the pattern [[Node Name]] or [[node-id|Display Text]]
// ---------------------------------------------------------------------------
export interface WikiLink {
  /** The raw target inside [[ ]] */
  raw: string;
  /** The canonical ID/alias being referenced (lowercased, spaces → hyphens) */
  target: string;
  /** Display text if provided via [[target|display]] */
  displayText?: string;
  /** The heading section this link was found under (for edge type inference) */
  section: string;
}

const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

// ---------------------------------------------------------------------------
// Code Block Extraction
// ---------------------------------------------------------------------------
export interface CodeBlock {
  lang: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Parser Output — Intermediate Representation of a single file
// ---------------------------------------------------------------------------
export interface ParserOutput {
  parsedMarkdown: ParsedMarkdown;
  wikiLinks: WikiLink[];
  codeBlocks: CodeBlock[];
}

const processor = unified().use(remarkParse);

/**
 * Parse the Markdown body from a LexerOutput into a structured IR.
 * Extracts: AST, hierarchical Sections, Wiki-links, Code blocks.
 */
export function parseMarkdown(lexed: LexerOutput): ParserOutput {
  const ast = processor.parse(lexed.rawBody) as Root;
  const sections = extractSections(ast);
  const wikiLinks = extractWikiLinks(lexed.rawBody, sections);
  const codeBlocks = extractCodeBlocks(ast);

  const parsedMarkdown: ParsedMarkdown = {
    raw: lexed.rawBody,
    ast,
    sections,
  };

  return { parsedMarkdown, wikiLinks, codeBlocks };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractSections(ast: Root): Section[] {
  const sections: Section[] = [];
  const stack: Section[] = []; // heading stack for nesting

  for (const node of ast.children) {
    if (node.type === 'heading') {
      const heading = node as Heading;
      const title = heading.children
        .filter((c) => c.type === 'text')
        .map((c) => (c as Text).value)
        .join('');

      const section: Section = { title, level: heading.depth, content: '', children: [] };

      // Pop stack until we find a parent of higher precedence
      while (stack.length > 0 && (stack[stack.length - 1]?.level ?? 0) >= heading.depth) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1]!.children.push(section);
      } else {
        sections.push(section);
      }

      stack.push(section);
    } else if (stack.length > 0) {
      // Append raw text content to the current section
      const current = stack[stack.length - 1]!;
      // Simple: stringify node position range from raw body is complex;
      // instead we accumulate paragraph/text types
      if (node.type === 'paragraph' || node.type === 'list' || node.type === 'blockquote') {
        current.content += '\n'; // placeholder — will be filled with raw slice
      }
    }
  }

  return sections;
}

function extractWikiLinks(rawBody: string, sections: Section[]): WikiLink[] {
  const links: WikiLink[] = [];
  let match: RegExpExecArray | null;

  // Track which section each link belongs to by scanning raw text line by line
  const lines = rawBody.split('\n');
  const lineToSection = buildLineToSectionMap(lines);

  let lineIndex = 0;
  for (const line of lines) {
    WIKI_LINK_REGEX.lastIndex = 0;
    while ((match = WIKI_LINK_REGEX.exec(line)) !== null) {
      const inner = match[1] ?? '';
      const pipeIdx = inner.indexOf('|');
      const target = pipeIdx >= 0 ? inner.slice(0, pipeIdx) : inner;
      const displayText = pipeIdx >= 0 ? inner.slice(pipeIdx + 1) : undefined;
      const canonicalTarget = target.toLowerCase().replace(/\s+/g, '-');
      const section = lineToSection[lineIndex] ?? 'body';

      links.push({ raw: inner, target: canonicalTarget, displayText, section });
    }
    lineIndex++;
  }

  return links;
}

function buildLineToSectionMap(lines: string[]): Record<number, string> {
  const map: Record<number, string> = {};
  let currentSection = 'body';

  lines.forEach((line, i) => {
    const headingMatch = /^#{1,6}\s+(.+)$/.exec(line);
    if (headingMatch) {
      currentSection = (headingMatch[1] ?? 'body').toLowerCase().replace(/\s+/g, '-');
    }
    map[i] = currentSection;
  });

  return map;
}

function extractCodeBlocks(ast: Root): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  for (const node of ast.children) {
    if (node.type === 'code') {
      blocks.push({ lang: node.lang ?? 'text', value: node.value });
    }
  }
  return blocks;
}
