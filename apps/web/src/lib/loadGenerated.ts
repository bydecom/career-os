import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { ResumeIR } from '@career-os/resume';

/** Monorepo root: apps/web → ../.. */
const ROOT = resolve(process.cwd(), '../..');
const GENERATED = resolve(ROOT, 'career-data/generated');

export type GraphStats = {
  totalNodes: number;
  totalEdges: number;
  parseTimeMs?: number;
};

export function loadResumeIR(): ResumeIR | null {
  const path = resolve(GENERATED, 'resume.ir.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as ResumeIR;
}

/** Compiler output from `npm run compile` → career-data/generated/stats.json */
export function loadGraphStats(): GraphStats | null {
  const path = resolve(GENERATED, 'stats.json');
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as Partial<GraphStats>;
  if (typeof raw.totalNodes !== 'number' || typeof raw.totalEdges !== 'number') return null;
  return {
    totalNodes: raw.totalNodes,
    totalEdges: raw.totalEdges,
    parseTimeMs: raw.parseTimeMs,
  };
}

export function formatGraphStats(stats: GraphStats | null, fallback = '— nodes · — edges'): string {
  if (!stats) return fallback;
  return `${stats.totalNodes} nodes · ${stats.totalEdges} edges`;
}

export function generatedHint(): string {
  return GENERATED;
}
