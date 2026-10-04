import { chatComplete, geminiComplete } from './openrouter.js';

interface Opts {
  system: string;
  user: string;
  temperature?: number;
  model?: string;
}

function hasOpenRouter(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}
function hasGemini(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
}

export function model(): string {
  return process.env.LLM_MODEL || process.env.LLM_MODEL_A || 'free/gpt-6-luna';
}

export async function llmComplete(opts: Opts): Promise<string> {
  if (hasOpenRouter()) {
    return chatComplete({ system: opts.system, user: opts.user, temperature: opts.temperature, model: opts.model });
  }
  if (hasGemini()) {
    return geminiComplete(opts.system, opts.user, opts.temperature ?? 0.7);
  }
  throw new Error('No LLM key configured. Set OPENROUTER_API_KEY (apinex) or GEMINI_API_KEY in server env.');
}

export function llmStatus(): { provider: string; configured: boolean; model?: string } {
  if (hasOpenRouter()) return { provider: 'apinex/openrouter-compat', configured: true, model: model() };
  if (hasGemini()) return { provider: 'gemini', configured: true };
  return { provider: 'none', configured: false };
}
