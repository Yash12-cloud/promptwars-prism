import { SYSTEM_REPORT } from './prompts.js';
import { ReportSchema } from './schemas.js';
import { llmComplete, model } from './llm/index.js';

export function extractJson(raw: string): any {
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

export async function runScan(decision: string, reasoning: string, confidence: number) {
  const ctx = buildContext(decision, reasoning, confidence);
  let raw = await llmComplete({
    system: SYSTEM_REPORT,
    user: ctx,
    temperature: 0.65,
    model: model(),
  });
  let parsed: any;
  try { parsed = extractJson(raw); } catch {
    // one retry with stricter instruction
    raw = await llmComplete({
      system: SYSTEM_REPORT + '\nIMPORTANT: Output ONLY raw valid JSON. No markdown, no prose, no code fences.',
      user: ctx,
      temperature: 0.4,
      model: model(),
    });
    try { parsed = extractJson(raw); } catch (e: any) { throw new Error(`Report parse failed: ${e.message}\nRaw: ${raw.slice(0, 400)}`); }
  }
  const validated = ReportSchema.safeParse(parsed);
  if (!validated.success) {
    raw = await llmComplete({
      system: SYSTEM_REPORT + '\nIMPORTANT: Follow the exact schema. All fields required. ripple node type MUST be one of: decision|first|second|third.',
      user: ctx,
      temperature: 0.4,
      model: model(),
    });
    try { parsed = extractJson(raw); } catch (e: any) { throw new Error(`Report parse failed: ${e.message}`); }
    const v2 = ReportSchema.safeParse(parsed);
    if (!v2.success) throw new Error(`Report validation failed: ${v2.error.message}`);
    return v2.data;
  }
  return validated.data;
}
