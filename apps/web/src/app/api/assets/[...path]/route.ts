import { readFileSync, existsSync } from 'fs';
import { extname } from 'path';
import { resolveSafeAssetPath, mediaKindFromFile } from '@/lib/projectAssets';

export const runtime = 'nodejs';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

type Props = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Props) {
  const { path: segments } = await params;
  const absolute = resolveSafeAssetPath(segments ?? []);
  if (!absolute || !existsSync(absolute)) {
    return new Response('Not found', { status: 404 });
  }

  const kind = mediaKindFromFile(absolute);
  if (kind === 'other') {
    return new Response('Unsupported', { status: 415 });
  }

  const ext = extname(absolute).toLowerCase();
  const body = readFileSync(absolute);
  return new Response(body, {
    headers: {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
