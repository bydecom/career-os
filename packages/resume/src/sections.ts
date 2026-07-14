/**
 * Lightweight section extraction from node body.raw.
 * Compiler section.content is often empty; raw markdown is the source of truth.
 */

const HEADING_RE = /^##\s+(.+)$/gm;

export function extractSection(raw: string, titles: string[]): string {
  const wanted = new Set(titles.map((t) => t.toLowerCase()));
  const matches = [...raw.matchAll(HEADING_RE)];
  for (let i = 0; i < matches.length; i++) {
    const title = (matches[i]![1] ?? '').trim();
    if (!wanted.has(title.toLowerCase())) continue;
    const start = matches[i]!.index! + matches[i]![0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : raw.length;
    return raw.slice(start, end).trim();
  }
  return '';
}

/** Prefer blockquote one-liner; else first paragraph. */
export function extractSummary(raw: string, maxChars: number): string {
  const overview = extractSection(raw, ['Overview', 'Summary']);
  const quote = overview.match(/^>\s*(?:Interview-friendly one-liner:\s*)?["']?(.+?)["']?\s*$/im);
  let text = quote?.[1]?.trim() || overview.split(/\n\n+/)[0]?.trim() || '';
  text = stripWikiLinks(text).replace(/^>\s*/gm, '').replace(/\s+/g, ' ').trim();
  if (text.length > maxChars) {
    text = text.slice(0, maxChars - 1).trimEnd() + '…';
  }
  return text;
}

export function extractBullets(raw: string, titles: string[], max: number): string[] {
  const section = extractSection(raw, titles);
  if (!section) return [];
  const bullets = section
    .split('\n')
    .map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1]?.trim())
    .filter((x): x is string => Boolean(x))
    .map((b) => stripWikiLinks(b).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return bullets.slice(0, max);
}

export function stripWikiLinks(text: string): string {
  return text
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, id: string, label?: string) =>
      (label ?? id).trim()
    )
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
