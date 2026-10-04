import { SYSTEM_ADVOCATE, SYSTEM_SKEPTIC, SYSTEM_REBUTTAL, SYSTEM_REPORT } from './prompts.js';
import { ReportSchema, AdvocateSchema, SkepticSchema, RebuttalSchema } from './schemas.js';
import { llmComplete, modelA, modelB } from './llm/index.js';

function extractJson(raw: string): any {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  // find first { ... last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in LLM output');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildContext(decision: string, reasoning: string, confidence: number): string {
  return `Decision: ${decision}\nReasoning:\n${reasoning}\nUser confidence: ${confidence}%\n`;
}

export async function runScan(
  decision: string,
  reasoning: string,
  confidence: number,
  onReportDelta?: (delta: string) => void,
) {
  const ctx = buildContext(decision, reasoning, confidence);
  let raw = await llmComplete({
    system: SYSTEM_REPORT,
    user: ctx,
    temperature: 0.65,
    streaming: !!onReportDelta,
    onDelta: onReportDelta,
    model: modelA(),
  });
  let parsed: any;
  try { parsed = extractJson(raw); } catch (e:any) {
    // one retry with stricter instruction
    raw = await llmComplete({
      system: SYSTEM_REPORT + '\nIMPORTANT: Output ONLY raw valid JSON. No markdown, no prose, no code fences.',
      user: ctx,
      temperature: 0.4,
      model: modelA(),
    });
    try { parsed = extractJson(raw); } catch (e2:any) { throw new Error(`Report parse failed: ${e2.message}\nRaw: ${raw.slice(0,400)}`); }
  }
  const validated = ReportSchema.safeParse(parsed);
  if (!validated.success) {
    raw = await llmComplete({
      system: SYSTEM_REPORT + '\nIMPORTANT: Follow the exact schema. All fields required. ripple node type MUST be one of: decision|first|second|third.',
      user: ctx,
      temperature: 0.4,
      model: modelA(),
    });
    try { parsed = extractJson(raw); } catch (e:any) { throw new Error(`Report parse failed: ${e.message}`); }
    const v2 = ReportSchema.safeParse(parsed);
    if (!v2.success) throw new Error(`Report validation failed: ${v2.error.message}`);
    return v2.data;
  }
  return validated.data;
}

export async function runDuel(
  decision: string,
  reasoning: string,
  confidence: number,
  onAdvDelta?: (d: string)=>void,
  onSkepDelta?: (d: string)=>void,
) {
  const ctx = buildContext(decision, reasoning, confidence);
  const [advRaw, skepRaw] = await Promise.all([
    llmComplete({ system: SYSTEM_ADVOCATE, user: ctx, temperature: 0.7, streaming: !!onAdvDelta, onDelta: onAdvDelta, model: modelA() }),
    llmComplete({ system: SYSTEM_SKEPTIC, user: ctx, temperature: 0.9, streaming: !!onSkepDelta, onDelta: onSkepDelta, model: modelB() }),
  ]);

  let advocate: any, skeptic: any;
  try { advocate = extractJson(advRaw); } catch { advocate = { points: [advRaw.slice(0,600)], verify: 'What one fact would flip you?' }; }
  try { skeptic = extractJson(skepRaw); } catch { skeptic = { points: [skepRaw.slice(0,600)], questions: [] }; }

  const advValidated = AdvocateSchema.safeParse(advocate);
  const skepValidated = SkepticSchema.safeParse(skeptic);
  // tolerate missing questions if LLM omitted
  if (!advValidated.success) throw new Error(`Advocate validation: ${advValidated.error.message}`);
  if (!skepValidated.success) {
    // repair: ensure questions array
    if (!skeptic.questions) skeptic.questions = [];
    const retry = SkepticSchema.safeParse(skeptic);
    if (!retry.success) throw new Error(`Skeptic validation: ${retry.error.message}`);
    skeptic = retry.data;
  } else skeptic = skepValidated.data;

  return { advocate: advValidated.data, skeptic, advRaw, skepRaw };
}

export async function runRebuttal(
  advocate: { points: string[]; verify: string },
  decision: string,
  reasoning: string,
  onDelta?: (d: string)=>void,
) {
  const ctx = `Original decision: ${decision}\nReasoning: ${reasoning}\nAdvocate said: ${JSON.stringify(advocate)}\nNow rebut the advocate.`;
  const raw = await llmComplete({ system: SYSTEM_REBUTTAL, user: ctx, temperature: 0.8, streaming: !!onDelta, onDelta, model: modelB() });
  let parsed: any;
  try { parsed = extractJson(raw); } catch { return { rebuttal: [raw.slice(0,600)] }; }
  const v = RebuttalSchema.safeParse(parsed);
  if (!v.success) return { rebuttal: parsed.rebuttal ?? [raw.slice(0,600)] };
  return v.data;
}

export type FullScan = {
  report: Awaited<ReturnType<typeof runScan>>;
  duel: Awaited<ReturnType<typeof runDuel>>;
};
