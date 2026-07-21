import { describe, it, expect } from 'vitest';
import { detectContinuation } from '../src/continuation.js';

describe('detectContinuation', () => {
  it('detects pronoun + zero metadata matches', () => {
    expect(detectContinuation('Dự án này có gì đặc biệt?', 0)).toBe(true);
    expect(detectContinuation('What about that project?', 0)).toBe(true);
  });

  it('does not treat pronoun-only as continuation when metadata already resolved', () => {
    expect(detectContinuation('Dự án này có gì đặc biệt?', 2)).toBe(false);
  });

  it('detects comparison phrases even when metadata matches exist', () => {
    expect(detectContinuation('So với RabbitMQ thì sao?', 1)).toBe(true);
    expect(detectContinuation('compare this vs Redis', 1)).toBe(true);
  });

  it('returns false for clear topic switches without pronoun/comparison', () => {
    expect(detectContinuation('Tell me about CareerOS', 0)).toBe(false);
    expect(detectContinuation('Why did you use Redis?', 1)).toBe(false);
  });
});
