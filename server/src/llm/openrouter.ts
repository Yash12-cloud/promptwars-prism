// OpenRouter adapter — streaming + non-streaming
// Env: OPENROUTER_API_KEY (set via Antideploy ai/keys) or OPENAI_API_KEY / GEMINI fallback.
// Base: https://openrouter.ai/api/v1 (OpenAI-compat). Also supports api/v1/chat/completions streaming.

const OR_BASE = process.env.OPENROUTER_BASE_URL || 'https://api.apinex.bond/v1';
const DEFAULT_MODEL = process.env.LLM_MODEL || process.env.LLM_MODEL_A || 'free/gpt-6-luna';

function getKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
}

interface CallOpts {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chatComplete(opts: CallOpts): Promise<string> {
  const key = getKey();
  if (!key) throw new Error('No LLM key set (OPENROUTER_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY)');
  const model = opts.model || DEFAULT_MODEL;
  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://promptwars.antideploy.app',
      'X-Title': 'PRISM - The Blind Spot',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2200,
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const j: any = await res.json();
  return j.choices?.[0]?.message?.content ?? '';
}

export async function chatStream(
  opts: CallOpts,
  onDelta: (delta: string) => void,
): Promise<string> {
  const key = getKey();
  if (!key) throw new Error('No LLM key set');
  const model = opts.model || DEFAULT_MODEL;
  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://promptwars.antideploy.app',
      'X-Title': 'PRISM - The Blind Spot',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2200,
      stream: true,
    }),
  });
  if (!res.ok) throw new Error(`LLM stream ${res.status}: ${await res.text()}`);
  if (!res.body) throw new Error('No stream body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const j = JSON.parse(trimmed.slice(6));
        const delta = j.choices?.[0]?.delta?.content ?? '';
        if (delta) { full += delta; onDelta(delta); }
      } catch {}
    }
  }
  return full;
}

// For direct Gemini REST (when user gave GEMINI key but not OpenRouter)
export async function geminiComplete(system: string, user: string, temp = 0.7): Promise<string> {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: temp, maxOutputTokens: 2400 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const j: any = await res.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
