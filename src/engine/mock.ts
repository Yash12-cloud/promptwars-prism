import type { AnalysisResult, DuelPayload, ExampleCase } from './types';

export const EXAMPLES: ExampleCase[] = [
  {
    id: 'intern',
    label: 'Internship Decision',
    icon: '🎓',
    decision: 'Whether to accept a 6-month internship at a well-known company near home',
    reasoning: `I'm mostly leaning to accept it. The stipend is really good — 30k per month — which is more than my friends are getting, and the company is just 20 minutes from home so I won't need to relocate. It's a known brand name so it will look good on my CV and give me industry experience. My timings would be 10-6, but I think I can manage college alongside. I haven't looked much into the actual team or mentorship — I assume a big company must have good learning. My seniors said it's a great opportunity so it feels like the obvious choice.`,
    confidence: 78,
  },
  {
    id: 'startup',
    label: 'Startup vs Corporate Job',
    icon: '🚀',
    decision: 'Choosing between a seed-stage startup offer and a stable corporate role',
    reasoning: `The startup offered me a 40% hike and an early employee title. The founders are impressive and the product is trending on Twitter right now. I feel if I don't join now I'll miss the rocketship. The corporate offer is lower pay but has structured learning, WLB, and a clear promotion track. I'm 26, so I keep telling myself I should take risks while I'm young. I haven't asked about runway, equity dilution, or what happens if the next round doesn't happen.`,
    confidence: 85,
  },
  {
    id: 'abroad',
    label: 'Move Abroad for Masters',
    icon: '✈️',
    decision: 'Whether to move to Germany for a masters degree next intake',
    reasoning: `I've been admitted to a good university in Berlin. Tuition is low and a lot of my friends are moving abroad this year so it feels like the right time. I assume I'll get a job easily after since Germany needs tech talent, and I've seen many success stories on LinkedIn. I haven't fully calculated living costs for 2 years, language barrier impact on internships, or what I would do if I don't get a post-study job within 6 months. My parents are supportive but I'd use most of my savings.`,
    confidence: 72,
  },
];

function pick<T>(arr: T[], n: number): T[] { return [...arr].sort(()=>0.5-Math.random()).slice(0,n); }

const POOLS = {
  assumptions: [
    { text: 'Prestige equals learning quality', flavor: 'Association' as const, risk: 'high' as const, test: 'What did the last 3 interns actually learn — who mentored them weekly?' },
    { text: 'Stipend today predicts career value tomorrow', flavor: 'Baseline' as const, risk: 'medium' as const, test: 'What is the 2-year salary trajectory of alumni who took this path?' },
    { text: 'Proximity = lower cost, always better', flavor: 'Outcome' as const, risk: 'medium' as const, test: 'What opportunity are you NOT exploring because closeness feels safe?' },
    { text: 'Social proof = evidence', flavor: 'Self-Perspective' as const, risk: 'high' as const, test: 'Are your seniors reporting survivorship bias or median outcome?' },
    { text: 'You can manage both college and full-time work cleanly', flavor: 'Inertia' as const, risk: 'high' as const, test: 'Map 3 weeks hour-by-hour — where does the conflict actually hit?' },
    { text: 'Joining now = never catching the same upside later', flavor: 'Baseline' as const, risk: 'medium' as const, test: 'List 3 other credible paths to the same goal without this urgency.' },
  ],
  biases: [
    { name: 'Halo Effect', flavor: 'Association' as const, quote: 'a known brand name', explain: 'Brand glow inflates assumptions about mentorship, work quality, and learning.' },
    { name: 'Anchoring', flavor: 'Baseline' as const, quote: 'more than my friends are getting', explain: 'Friends’ stipend becomes anchor; absolute value vs market is unexamined.' },
    { name: 'Availability Heuristic', flavor: 'Association' as const, quote: 'My seniors said it’s great', explain: 'Vivid, recent story feels like data; base rate is missing.' },
    { name: 'Optimism Bias', flavor: 'Outcome' as const, quote: 'I think I can manage college alongside', explain: 'Underestimates friction; planning fallacy with no buffer accounted.' },
    { name: 'Status Quo / Inertia', flavor: 'Inertia' as const, quote: 'feels like the obvious choice', explain: 'Framing avoids generating a third option.' },
    { name: 'Narrow Framing', flavor: 'Self-Perspective' as const, quote: 'startup vs corporate — nothing else', explain: 'Artificial binary; deletes shadow options like defer, part-time, project.' },
  ],
  socratic: [
    'What evidence would make you PROVE this assumption false, not true?',
    'What would someone who deeply regretted this choice say you over-weighted?',
    'What observable fact in week 1 would tell you learning is weak?',
    'What base rate are you ignoring — what happens to the median person, not the highlight reel?',
    'If you advised a friend with the same facts, what would you warn them about?',
    'What small experiment in 48 hours would reduce your uncertainty the most?',
  ],
  frames: [
    { title: 'The Advisor Frame', desc: 'What would you tell your best friend in this exact situation?', icon: '🪞' },
    { title: 'The Employer Frame', desc: 'What does the company/store/university optimize for — not you?', icon: '🏢' },
    { title: 'The 10/10/10 Frame', desc: 'How will you feel in 10 days, 10 months, 10 years?', icon: '⏳' },
    { title: 'The Inversion Frame', desc: 'How would you guarantee failure? Now invert it.', icon: '🔄' },
    { title: 'The Base Rate Frame', desc: 'What happens to 100 people who made this exact choice?', icon: '📊' },
  ],
  experiments: [
    { title: 'Mentorship Audit', time: '<30m', desc: 'Ask for names of 2 past interns, 15-min call: who mentored them weekly?' },
    { title: 'Calendar Stress Test', time: '1 day', desc: 'Block 3 realistic weeks hour-by-hour including college + commute.' },
    { title: 'Shadow Option Sketch', time: '3 days', desc: 'Design one credible alternative that achieves the same goal without this choice.' },
    { title: 'Runway Check', time: '<30m', desc: 'Ask founders/hiring manager directly: runway, conversion rate, attrition.' },
    { title: 'Cost Map', time: '1 day', desc: 'Total 2-year cost vs median outcome salary for next 3 years.' },
  ],
  premortems: [
    { title: 'The Drift', story: 'It’s week 8. You’re doing data entry, no mentor, and your grades slip. You realize the stipend cost you momentum.', prob: 'Medium' },
    { title: 'The Golden Cage', story: 'Six months later the brand is on your CV but you learned nothing transferable. The “experience” is a line item, not a skill.', prob: 'Medium' },
    { title: 'The Burnout Gap', story: 'You tried to do both. Exams suffer, you go inactive, and you regret not negotiating part-time or deferring.', prob: 'High' },
  ],
};

export function mockResult(input: string, confidence: number, decisionTitle?: string): AnalysisResult {
  const lower = input.toLowerCase();
  // tiny heuristic to pick relevant biases
  let biases = [...POOLS.biases];
  if (lower.includes('brand') || lower.includes('prestig')) biases = biases.sort(a=> a.name==='Halo Effect'?-1:0);
  return {
    title: decisionTitle || inferTitle(input),
    summary: 'You’re optimizing for visible rewards — check the invisible costs you haven’t priced yet.',
    assumptions: pick(POOLS.assumptions, 4),
    biases: pick(biases, 3),
    socratic: pick(POOLS.socratic, 5),
    frames: pick(POOLS.frames, 3),
    experiments: pick(POOLS.experiments, 3),
    premortems: pick(POOLS.premortems, 3),
    ripples: {
      nodes: [
        { id:'d', label:'Take the offer', type:'decision', x:50, y:50 },
        { id:'a', label:'Stipend boost', type:'first', x:22, y:18 },
        { id:'b', label:'Less college time', type:'first', x:78, y:22 },
        { id:'c', label:'Brand on CV', type:'second', x:18, y:78 },
        { id:'e', label:'Mentorship unknown', type:'second', x:52, y:88 },
        { id:'f', label:'Burnout risk', type:'third', x:82, y:76 },
      ],
      edges: [['d','a'],['d','b'],['a','c'],['b','e'],['b','f'],['e','f']] as [string,string][]
    },
    confidenceNote: confidence >= 80
      ? `You report ${confidence}% confidence but cite 0 disconfirming facts. Typical miscalibration is +18% in career choices — price one disconfirming search.`
      : `At ${confidence}% confidence, good — you’re uncertain. Best move: run one sub-30-minute experiment before you update to 90%+.`,
  };
}

export function mockDuel(_input: string): DuelPayload {
  return {
    advocate: {
      points: [
        'Your lean is financially rational — stipend lifts autonomy and signals market validation now.',
        'Proximity saves ~2 hrs/day vs relocating; that time compounds into study or rest.',
        'Brand leverage is real — 3 alumni used this exact line to get shortlisted faster.',
      ],
      verify: 'If you learned the day-to-day work is admin-heavy, would the stipend still outweigh it?'
    },
    skeptic: {
      points: [
        '[Halo Effect — Association] “known brand” ≠ known mentorship. You have zero data on manager quality.',
        '[Optimism Bias — Outcome] “I can manage college alongside” with no hour-by-hour map; planning fallacy risk high.',
        '[Availability — Association] Senior anecdotes feel like base rates; ask for median intern outcome, not highlight reel.',
      ],
      questions: [
        'What observable signal in week 1 would prove learning is weak?',
        'What third option did narrow framing delete — part-time, defer, project sprint?'
      ]
    },
    rebuttal: [
      'Advocate cites autonomy, but autonomy funded by 6 months of weak skill compounding is expensive long-term.',
      'Time saved on commute is lost to context-switching between full-time work and college — map it.',
      'Brand shortlist help is weakest in year one; skill proof beats logo after first screen.',
    ]
  };
}

function inferTitle(input: string): string {
  if (/intern/i.test(input)) return 'Internship Decision';
  if (/startup/i.test(input)) return 'Startup vs Corporate';
  if (/germany|berlin|masters/i.test(input)) return 'Move Abroad for Masters';
  return 'Your Decision';
}
