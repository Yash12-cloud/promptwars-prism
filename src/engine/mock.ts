import type { ExampleCase } from './types';

// Prefill examples for the composer. All analysis is live (POST /api/scan) —
// nothing below is used as mock output.
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
