import { describe, expect, it } from 'vitest';
import { SYSTEM_ADVOCATE, SYSTEM_SKEPTIC, SYSTEM_REBUTTAL, SYSTEM_REPORT } from './prompts.js';

describe('prompt contracts', () => {
  it('every system prompt forbids deciding for the user', () => {
    for (const p of [SYSTEM_ADVOCATE, SYSTEM_SKEPTIC, SYSTEM_REBUTTAL, SYSTEM_REPORT]) {
      expect(p).toMatch(/NEVER recommend/i);
    }
  });

  it('every system prompt demands strict JSON', () => {
    for (const p of [SYSTEM_ADVOCATE, SYSTEM_SKEPTIC, SYSTEM_REBUTTAL, SYSTEM_REPORT]) {
      expect(p).toMatch(/STRICT JSON/i);
    }
  });

  it('skeptic prompt enforces disagreement (anti-sycophancy)', () => {
    expect(SYSTEM_SKEPTIC).toMatch(/MUST disagree/i);
  });

  it('advocate prompt forbids bias talk', () => {
    expect(SYSTEM_ADVOCATE).toMatch(/Do NOT.*bias/i);
  });

  it('report prompt requires all sections', () => {
    for (const key of ['assumptions', 'biases', 'socratic', 'frames', 'experiments', 'premortems', 'ripples', 'confidenceNote']) {
      expect(SYSTEM_REPORT).toContain(key);
    }
  });
});
