import { describe, expect, it } from 'vitest';
import { ReportSchema } from './schemas.js';

const validReport = {
  title: 'Accept internship',
  summary: 'Trading short-term stipend for uncertain learning.',
  assumptions: [
    { text: 'Brand equals mentorship', flavor: 'Association', risk: 'high', test: 'Who mentored last interns weekly?' },
    { text: 'Peers set the market', flavor: 'Baseline', risk: 'medium', test: 'What is the market median stipend?' },
    { text: 'College plus full-time is fine', flavor: 'Inertia', risk: 'high', test: 'Map three real weeks hour by hour.' },
  ],
  biases: [
    { name: 'Halo Effect', flavor: 'Association', quote: 'known brand name', explain: 'Brand glow inflates learning assumptions.' },
    { name: 'Optimism Bias', flavor: 'Outcome', quote: 'I can manage college alongside', explain: 'Underestimates friction.' },
  ],
  socratic: ['What would disprove this?', 'What did the median intern get?', 'What is week-one proof of learning?'],
  frames: [{ title: 'Advisor Frame', desc: 'What would you tell a friend?', icon: '🪞' }, { title: '10/10/10', desc: 'Feelings in 10 days/months/years?', icon: '⏳' }],
  experiments: [{ title: 'Mentorship Audit', time: '<30m', desc: 'Call two past interns.' }, { title: 'Calendar Test', time: '1 day', desc: 'Block three real weeks.' }],
  premortems: [{ title: 'The Drift', story: 'Week 8, data entry, grades slip.', prob: 'Medium' }, { title: 'Golden Cage', story: 'Brand on CV, no skills.', prob: 'Low' }],
  ripples: {
    nodes: [
      { id: 'd', label: 'Take offer', type: 'decision', x: 50, y: 50 },
      { id: 'a', label: 'Stipend', type: 'first', x: 25, y: 20 },
      { id: 'b', label: 'Less study', type: 'first', x: 75, y: 20 },
      { id: 'c', label: 'CV line', type: 'second', x: 25, y: 75 },
      { id: 'e', label: 'Weak skills', type: 'second', x: 55, y: 80 },
      { id: 'f', label: 'Burnout', type: 'third', x: 80, y: 70 },
    ],
    edges: [['d', 'a'], ['d', 'b'], ['a', 'c'], ['b', 'e'], ['b', 'f']],
  },
  confidenceNote: 'At 78%: cite one disconfirming fact before updating.',
};

describe('ReportSchema', () => {
  it('accepts a complete valid report', () => {
    expect(ReportSchema.safeParse(validReport).success).toBe(true);
  });

  it('rejects a report missing required sections', () => {
    const { socratic, ...rest } = validReport;
    expect(ReportSchema.safeParse(rest).success).toBe(false);
  });

  it('normalizes messy LLM enum values', () => {
    const messy = {
      ...validReport,
      assumptions: [{ text: 'x', flavor: 'halo / availability', risk: 'HIGH!!', test: 'y' }, ...validReport.assumptions.slice(1)],
      ripples: {
        nodes: validReport.ripples.nodes.map((n, i) => (i === 1 ? { ...n, type: 'first-order', x: '25', y: '20' } : n)),
        edges: validReport.ripples.edges,
      },
    };
    const parsed = ReportSchema.safeParse(messy);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.assumptions[0].flavor).toBe('Association');
      expect(parsed.data.assumptions[0].risk).toBe('high');
      expect(parsed.data.ripples.nodes[1].type).toBe('first');
      expect(parsed.data.ripples.nodes[1].x).toBe(25);
    }
  });

  it('rejects too few assumptions', () => {
    expect(ReportSchema.safeParse({ ...validReport, assumptions: [] }).success).toBe(false);
  });
});
