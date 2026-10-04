import { z } from 'zod';

const FlavorEnum = z.enum(['Association','Baseline','Inertia','Outcome','Self-Perspective']);
function normFlavor(v: any): any {
  if (typeof v !== 'string') return v;
  const s = v.toLowerCase().replace(/[^a-z]/g, '');
  if (s.includes('assoc') || s.includes('halo') || s.includes('avail')) return 'Association';
  if (s.includes('base') || s.includes('anchor') || s.includes('framing')) return 'Baseline';
  if (s.includes('inert') || s.includes('status') || s.includes('sunk')) return 'Inertia';
  if (s.includes('outcome') || s.includes('optim') || s.includes('plan')) return 'Outcome';
  return 'Self-Perspective';
}
const FlavorSchema = z.preprocess(normFlavor, FlavorEnum);

const RiskEnum = z.enum(['low','medium','high']);
function normRisk(v: any): any {
  if (typeof v !== 'string') return v;
  const s = v.toLowerCase();
  if (s.includes('high')) return 'high';
  if (s.includes('low')) return 'low';
  return 'medium';
}
const RiskSchema = z.preprocess(normRisk, RiskEnum);

export const AssumptionSchema = z.object({
  text: z.string(),
  flavor: FlavorSchema,
  risk: RiskSchema,
  test: z.string(),
});
export const BiasSchema = z.object({
  name: z.string(),
  flavor: FlavorSchema,
  quote: z.string(),
  explain: z.string(),
});
export const FrameSchema = z.object({ title: z.string(), desc: z.string(), icon: z.string() });
export const ExperimentSchema = z.object({ title: z.string(), time: z.string(), desc: z.string() });
export const PremortemSchema = z.object({ title: z.string(), story: z.string(), prob: z.string() });
const NodeTypeEnum = z.enum(['decision','first','second','third']);
function normNodeType(v: any): any {
  if (typeof v !== 'string') return v;
  const s = v.toLowerCase();
  if (s.includes('decision')) return 'decision';
  if (s.includes('first') || s === '1' || s.includes('immediate')) return 'first';
  if (s.includes('second') || s === '2') return 'second';
  if (s.includes('third') || s === '3' || s.includes('long')) return 'third';
  return s;
}
const NodeTypeSchema = z.preprocess(normNodeType, NodeTypeEnum);

function normNum(v: any): any {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && isFinite(n) ? n : v;
}
const NumSchema = z.preprocess(normNum, z.number());

export const RippleNodeSchema = z.object({ id: z.string(), label: z.string(), type: NodeTypeSchema, x: NumSchema, y: NumSchema });
export const RipplesSchema = z.object({ nodes: z.array(RippleNodeSchema), edges: z.array(z.tuple([z.string(), z.string()])) });

export const ReportSchema = z.object({
  title: z.string(),
  summary: z.string(),
  assumptions: z.array(AssumptionSchema).min(3),
  biases: z.array(BiasSchema).min(2),
  socratic: z.array(z.string()).min(3),
  frames: z.array(FrameSchema).min(2),
  experiments: z.array(ExperimentSchema).min(2),
  premortems: z.array(PremortemSchema).min(2),
  ripples: RipplesSchema,
  confidenceNote: z.string(),
});

export const AdvocateSchema = z.object({ points: z.array(z.string()).min(2), verify: z.string() });
export const SkepticSchema = z.object({ points: z.array(z.string()).min(2), questions: z.array(z.string()).min(1) });
export const RebuttalSchema = z.object({ rebuttal: z.array(z.string()).min(2) });

export type Report = z.infer<typeof ReportSchema>;
export type Advocate = z.infer<typeof AdvocateSchema>;
export type Skeptic = z.infer<typeof SkepticSchema>;
