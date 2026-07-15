import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { ResumeIR } from '@career-os/resume';

/** Monorepo root: apps/web → ../.. */
const ROOT = resolve(process.cwd(), '../..');
const GENERATED = resolve(ROOT, 'career-data/generated');

export function loadResumeIR(): ResumeIR | null {
  const path = resolve(GENERATED, 'resume.ir.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as ResumeIR;
}

export function generatedHint(): string {
  return GENERATED;
}
