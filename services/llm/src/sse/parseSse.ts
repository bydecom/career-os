// ---------------------------------------------------------------------------
// Generic SSE parser — not Gemini-specific.
// Handles multi-line `data:` frames and ignores event/id/retry fields.
// ---------------------------------------------------------------------------

export interface SseFrame {
  event?: string;
  id?: string;
  data: string;
}

/**
 * Incremental SSE parser. Feed decoded text chunks; yields complete frames
 * whenever a blank line terminates an event.
 */
export class SseParser {
  private buffer = '';

  /** Push a decoded chunk; returns any complete frames found. */
  push(chunk: string): SseFrame[] {
    this.buffer += chunk;
    const frames: SseFrame[] = [];

    // SSE events are separated by a blank line (\n\n or \r\n\r\n).
    while (true) {
      const normalized = this.buffer.replace(/\r\n/g, '\n');
      const sep = normalized.indexOf('\n\n');
      if (sep < 0) {
        this.buffer = normalized;
        break;
      }

      const rawEvent = normalized.slice(0, sep);
      this.buffer = normalized.slice(sep + 2);
      const frame = parseFrame(rawEvent);
      if (frame) frames.push(frame);
    }

    return frames;
  }

  /** Flush any remaining buffered event (end of stream). */
  flush(): SseFrame[] {
    const leftover = this.buffer.trim();
    this.buffer = '';
    if (!leftover) return [];
    const frame = parseFrame(leftover);
    return frame ? [frame] : [];
  }
}

function parseFrame(raw: string): SseFrame | null {
  const dataLines: string[] = [];
  let event: string | undefined;
  let id: string | undefined;

  for (const line of raw.split('\n')) {
    if (!line || line.startsWith(':')) continue; // comment / heartbeat
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
      continue;
    }
    if (line.startsWith('id:')) {
      id = line.slice(3).trim();
      continue;
    }
    if (line.startsWith('retry:')) continue;
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) return null;
  return { event, id, data: dataLines.join('\n') };
}
