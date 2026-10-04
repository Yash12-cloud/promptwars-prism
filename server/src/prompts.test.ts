import { describe, expect, it } from 'vitest';
import { SYSTEM_REPORT } from './prompts.js';

describe('prompt contracts', () => {
  it('forbids deciding for the user', () => {
    expect(SYSTEM_REPORT).toMatch(/NEVER recommend/i);
  });

  it('demands strict JSON', () => {
    expect(SYSTEM_REPORT).toMatch(/STRICT JSON/i);
  });

  it('requires all report sections', () => {
    for (const key of ['assumptions', 'biases', 'socratic', 'frames', 'experiments', 'premortems', 'ripples', 'confidenceNote']) {
      expect(SYSTEM_REPORT).toContain(key);
    }
  });
});
