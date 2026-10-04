# PRISM — The Blind Spot

> **Don't decide. See clearly.** An AI thought partner that holds up a mirror to your reasoning — it never decides for you.

Built for the **PromptWars "THE BLIND SPOT"** challenge: people decide on what's most visible and overlook assumptions, missing factors, and conflicts in their own reasoning. PRISM surfaces those blind spots.

## What it does

1. **You paste your reasoning** (e.g. a student leaning toward a 6-month internship for stipend + brand + proximity).
2. **Blind Spot Report** — unstated assumptions (Dimara 5 flavors), bias tags with your own words as evidence, Socratic questions, reframes, small experiments, confidence calibration.
3. **Blind-spot analysis** — one model (`free/gpt-6-luna`) analyzes your reasoning end-to-end via `POST /api/scan` and returns the full report as validated JSON (one auto-retry on parse failure).
4. **Premortem + Ripple Map** — three future-regret stories (Klein, HBR 2007) and a second-order consequence graph.

**Rule enforced in prompts, schemas, and UI copy: the system never recommends a decision.**

## Architecture

```
Browser (React 19 + Vite + Tailwind, ChatGPT-style graphite-on-paper)
   │  REST: POST /api/scan, GET /api/health
Node server (Express 5 + zod)
   ├─ orchestrator: single runScan with Zod-validated strict-JSON output
   ├─ one auto-retry with stricter prompt on parse/validation failure
   └─ apinex OpenRouter-compatible endpoint (keys server-side only)
```

## Run locally

```bash
npm install
# .env (server-side only, never VITE_):
# OPENROUTER_API_KEY=sk-apx4...
# OPENROUTER_BASE_URL=https://api.apinex.bond/v1
# LLM_MODEL=free/gpt-6-luna
npm test        # vitest: 11 tests (schemas, JSON parsing, prompt contracts)
npm run dev     # client :5173 + server :3001 (vite proxies /api + /ws)
npm run build   # client dist + server dist
npm start       # serves dist/ + /ws + /api on $PORT
```

## Accessibility

ChatGPT-style graphite-on-paper system, audited for: AA contrast (`#767676` muted floor), visible `:focus-visible` rings, skip-to-content link, labelled inputs (`htmlFor`/`id`, `aria-describedby`), `role="alert"` errors, `role="dialog"` mobile nav, `aria-busy` scan state, and `prefers-reduced-motion` support.

## Deploy

Deployed on **Antideploy** (`Dockerfile` at root, `start: node server/dist/index.js`, listens on `$PORT`). Secrets are set via the Antideploy API (`PUT /api/v1/secrets`); the pushed `.env` is captured into the encrypted store and dropped from the build.

## Demo (45 sec)

Keep the internship example → **Scan** → Report (Halo Effect, Optimism Bias) → **Premortem** (three regret futures + ripple map) → *"We never decide for you."*

## Frameworks cited

Pronin et al. (2002) Bias Blind Spot · Dimara et al. 5-flavor taxonomy · Klein (2007) Premortem, HBR · Heath *Decisive* (WRAP) · de Bono Six Hats · Sharma et al. (2024) sycophancy · Stanford HAI adversarial collaboration.

## Team

3 people — Yash + friend + opencode (Muse Spark). Event day: 2026-10-04.
