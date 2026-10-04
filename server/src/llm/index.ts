import { chatComplete, chatStream, geminiComplete } from './openrouter.js';

interface Opts {
  system: string;
  user: string;
  temperature?: number;
  streaming?: boolean;
  onDelta?: (d: string) => void;
  model?: string;
}

function hasOpenRouter(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}
function hasGemini(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
}

export function modelA(): string {
  return process.env.LLM_MODEL_A || process.env.LLM_MODEL || 'free/gpt-6-luna';
}
export function modelB(): string {
  return process.env.LLM_MODEL_B || process.env.LLM_MODEL || 'free/glm-5.3-flash';
}

export async function llmComplete(opts: Opts): Promise<string> {
  if (hasOpenRouter()) {
    if (opts.streaming && opts.onDelta) return chatStream({ system: opts.system, user: opts.user, temperature: opts.temperature, model: opts.model }, opts.onDelta);
    return chatComplete({ system: opts.system, user: opts.user, temperature: opts.temperature, model: opts.model });
  }
  if (hasGemini()) {
    // Gemini doesn't stream via REST easily — use non-streaming
    if (opts.streaming && opts.onDelta) {
      const text = await geminiComplete(opts.system, opts.user, opts.temperature ?? 0.7);
      // fake streaming: chunk by 12 chars
      for (let i = 0; i < text.length; i += 12) {
        opts.onDelta(text.slice(i, i + 12));
        await new Promise(r => setTimeout(r, 12));
      }
      return text;
    }
    return geminiComplete(opts.system, opts.user, opts.temperature ?? 0.7);
  }
  throw new Error('No LLM key configured. Set OPENROUTER_API_KEY (apinex) or GEMINI_API_KEY in server env.');
}

export function llmStatus(): { provider: string; configured: boolean; modelA?: string; modelB?: string } {
  if (hasOpenRouter()) return { provider: 'apinex/openrouter-compat', configured: true, modelA: modelA(), modelB: modelB() };
  if (hasGemini()) return { provider: 'gemini', configured: true };
  return { provider: 'none', configured: false };
}
