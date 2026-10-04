import { describe, expect, it } from 'vitest';
import { extractJson } from './orchestrator.js';

describe('extractJson', () => {
  it('parses raw JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips markdown fences', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('extracts JSON embedded in prose', () => {
    expect(extractJson('Here is my analysis: {"points":["x"]} hope it helps')).toEqual({ points: ['x'] });
  });

  it('throws when no JSON object exists', () => {
    expect(() => extractJson('no braces here')).toThrow();
  });
});
