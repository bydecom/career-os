import type { ReactNode } from 'react';

/**
 * Render a small subset of inline Markdown for ResumeIR text fields.
 * Supports **bold** only — enough for knowledge-node emphasis without a full MD parser.
 */
export function inlineMd(text: string): ReactNode {
  if (!text.includes('**')) return text;

  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <strong key={`b${key++}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>,
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : parts;
}
