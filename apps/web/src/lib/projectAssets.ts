import { existsSync } from 'fs';
import { resolve, normalize, sep } from 'path';

/** Monorepo root from apps/web */
const ROOT = resolve(process.cwd(), '../..');
export const ASSETS_ROOT = resolve(ROOT, 'career-data/assets');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

export type ProjectMediaSlot = {
  /** Filename inside career-data/assets/<projectId>/ */
  file: string;
  kind: 'image' | 'video';
  role: 'cover' | 'poster' | 'demo' | 'gallery';
  caption: string;
  /** True when the file exists on disk */
  present: boolean;
  /** Public URL via /api/assets/... */
  src: string;
  /** Optional poster URL for video */
  posterSrc?: string;
};

const DEFAULT_SLOTS: Omit<ProjectMediaSlot, 'present' | 'src' | 'posterSrc'>[] = [
  { file: 'cover.png', kind: 'image', role: 'cover', caption: 'Cover' },
  { file: 'demo.mp4', kind: 'video', role: 'demo', caption: 'Demo' },
  { file: 'gallery-01.png', kind: 'image', role: 'gallery', caption: 'Gallery' },
];

function assetUrl(projectId: string, file: string) {
  return `/api/assets/${projectId}/${file}`;
}

export function listProjectMedia(projectId: string): ProjectMediaSlot[] {
  const dir = resolve(ASSETS_ROOT, projectId);
  const posterFile = 'poster.png';
  const posterPresent = existsSync(resolve(dir, posterFile));

  return DEFAULT_SLOTS.map((slot) => {
    const present = existsSync(resolve(dir, slot.file));
    return {
      ...slot,
      present,
      src: assetUrl(projectId, slot.file),
      posterSrc:
        slot.kind === 'video' && posterPresent ? assetUrl(projectId, posterFile) : undefined,
    };
  });
}

/**
 * Resolve a safe absolute path under career-data/assets.
 * Returns null if the path escapes the assets root.
 */
export function resolveSafeAssetPath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (segments.some((s) => s === '..' || s.includes('\0') || s.includes('/') || s.includes('\\'))) {
    return null;
  }
  const joined = resolve(ASSETS_ROOT, ...segments);
  const normalizedRoot = normalize(ASSETS_ROOT + sep);
  const normalizedJoined = normalize(joined);
  if (!normalizedJoined.startsWith(normalizedRoot) && normalizedJoined !== ASSETS_ROOT) {
    return null;
  }
  return joined;
}

export function mediaKindFromFile(file: string): 'image' | 'video' | 'other' {
  const ext = file.includes('.') ? file.slice(file.lastIndexOf('.')).toLowerCase() : '';
  if (IMAGE_EXT.has(ext)) return 'image';
  if (VIDEO_EXT.has(ext)) return 'video';
  return 'other';
}
