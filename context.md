# PRISM — The Blind Spot | Project Context

> Last updated: 2026-10-04 (event day). Full production build — NOT a 3hr prototype.

---

## 1. Challenge Brief (from PDF)

**File:** `/home/yash/Downloads/THE BLIND SPOT.pdf`

> **Problem:** People make decisions based on the most visible info. They overlook important factors, rely on unstated assumptions, or fail to recognize conflicts in their own reasoning.
>
> **Challenge:** Build an AI-powered solution that helps users identify potential blind spots in their reasoning when considering a decision. Encourage users to examine assumptions, recognize what they overlooked, explore questions for a more informed decision.
>
> **Rule:** The system must NOT make the decision for the user. Its purpose is to help the user think more critically.
>
> **Example:** A student choosing a 6-month internship (stipend, location, hours, role, learning, college schedule) leans on it because of good stipend, near home, industry experience. AI should surface what's overlooked: academics impact, actual learning/mentorship, long-term career prospects — and question assumptions. Do not decide for them.

**Constraints:**
- 3 hours (we're treating it as a production build anyway)
- Must be deployed & accessible via working link
- No organizer-provided dataset
- Any tech stack / approach
- Must demonstrate meaningful use of AI

**Submission requirements:**
1. Working deployed application
2. GitHub repository
3. Brief description of the solution

**Author:** Priyal Raut · Created 2026-09-22

---

## 2. Team & Constraints

- **Team:** 3 people — user (yash) + opencode (me) + 1 friend
- **Event:** PromptWars hackathon, 2026-10-04
- **Hosting chosen:** **Antideploy** (`https://antideploy.com`) — see section 6
- **WS decided:** Yes — websocket orchestrator for streaming duel deltas
- **No mock data:** Final build removes mock AI entirely — live AI via server keys

---

## 3. Product Strategy

**Positioning:** PRISM = Thought Partner, NOT Oracle.

- Anti-sycophancy by design (LLM agrees with users by default — we force disagreement)
- Cite: Pronin et al. (2002) Bias Blind Spot, Dimara et al. 5 flavors, Klein Premortem (HBR 2007), WRAP (Heath), Socratic Questioning, Sharma et al. 2024 sycophancy, Stanford HAI 2024 Adversarial Collaboration
- Dimara 5 flavors used as classifier: **Association · Baseline · Inertia · Outcome · Self-Perspective**

**4 screens in the app:**
1. **Report** — assumptions (5, with flavor + risk + test), bias tags, Socratic questions, reframes, experiments, calibration note
2. **Duel** — Steelman (Advocate) vs Skeptic split-screen, parallel WS streaming, rebuttal round where Skeptic attacks Advocate
3. **Premortem** — 3 future-regret narratives + ripple map (SVG graph of 1st/2nd/3rd order consequences)
4. Landing hero within same page — input card + 3 example buttons

---

## 4. Architecture (Production Full-Stack)

```
┌─────────────────────────────────────────────────────────────┐
│ Browser: React 19 + Vite + Tailwind 3 (client/dist)         │
│   ├─ src/App.tsx          (page, tabs: Report|Duel|Premortem)│
│   ├─ components/ (Header, InputPanel, Report, Duel, Premortem)│
│   ├─ hooks/usePrismWS.ts (WS client)                        │
│   └─ engine/ (mock.ts kept for EXAMPLES only, types.ts)     │
└──────────────────────────┬──────────────────────────────────┘
                           │ wss:// (path /ws)  + REST /api
┌──────────────────────────▼──────────────────────────────────┐
│ Node Server: Express 5 + ws + zod (server/src)              │
│   ├─ index.ts         Express app + WS /ws + REST /api/*    │
│   ├─ ws.ts            WS protocol router (scan:start, ...)  │
│   ├─ orchestrator.ts  runScan / runDuel / runRebuttal       │
│   ├─ prompts.ts       Anti-sycophancy system prompts        │
│   ├─ schemas.ts       Zod validation for LLM JSON           │
│   └─ llm/             openrouter.ts (streaming adapter),    │
│                       index.ts (provider router)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                 ┌─────────▼──────────┐
                 │ OpenRouter / Gemini │
                 │ (LLM provider)      │
                 └────────────────────┘
```

**Key principle:** API keys live ONLY on the server (`server/.env` or Antideploy secrets). Nothing with a `VITE_` prefix in production.

---

## 5. File Inventory

```
/home/yash/Downloads/PromptWars/
├── package.json              # scripts below; deps: express, ws, zod, cors, dotenv, framer-motion, lucide-react
├── vite.config.ts            # proxy /api + /ws → localhost:3001
├── tsconfig.json             # references app + node
├── tsconfig.app.json         # client (src), noEmit
├── tsconfig.node.json        # vite.config.ts, noEmit
├── Dockerfile                # multi-stage: build → node:22-alpine runtime
├── .dockerignore
├── .env.example              # server env template (OPENROUTER_API_KEY, GEMINI_API_KEY, ...)
├── vercel.json               # SPA rewrite (kept, unused if Antideploy)
├── README.md                 # default Vite template — TODO: replace with real README
├── dist/                     # vite build output (client)
│   ├── index.html
│   └── assets/index-*.js|css
│
├── src/                      # CLIENT (React 19 + Tailwind)
│   ├── main.tsx
│   ├── App.tsx               # main page, WS+REST fallback logic, tabs, premortem/duel/report wiring
│   ├── index.css             # Tailwind + fonts (Fraunces, Instrument Sans, JetBrains Mono)
│   ├── components/
│   │   ├── Header.tsx        # logo + reset + tagline
│   │   ├── InputPanel.tsx    # hero + example buttons + textarea + confidence slider + WS status badge
│   │   ├── Report.tsx        # assumptions/biases/socratic/frames/experiments cards
│   │   ├── Duel.tsx          # Steelman vs Skeptic split-screen + rebuttal card + vote footer
│   │   └── Premortem.tsx     # premortem cards + SVG ripple map
│   ├── hooks/usePrismWS.ts   # WS client hook: connect, ensureHandlers, streaming buffers
│   └── engine/
│       ├── mock.ts           # EXAMPLES only (3 prefilled decisions); mock pools remain but unused
│       ├── types.ts          # Shared TS types
│       └── ai.ts             # DEPRECATED — says keys removed, do not import
│
└── server/                   # SERVER (Node + Express + WS)
    ├── tsconfig.json         # extends ../tsconfig.node.json — **BUG: inherits noEmit:true, must override**
    ├── dist/                 # EMPTY (tsc emits nothing due to noEmit inherited) — NEEDS FIX
    └── src/
        ├── index.ts          # Express app: /api/health, /api/scan, /api/rebuttal, static dist, /ws
        ├── ws.ts             # WS protocol: scan:start, rebuttal:run → report:delta, duel:*:delta, scan:complete, rebuttal:complete
        ├── orchestrator.ts   # runScan (stream report), runDuel (parallel advocate+skeptic, streamed), runRebuttal
        ├── prompts.ts        # SYSTEM_BASE, ADVOCATE, SKEPTIC, REBUTTAL, REPORT (anti-sycophancy, strict JSON)
        ├── schemas.ts        # Zod: ReportSchema, AdvocateSchema, SkepticSchema, RebuttalSchema
        └── llm/
            ├── openrouter.ts # OpenRouter streaming adapter + Gemini REST fallback
            └── index.ts      # llmComplete() router: openrouter > gemini > throw
```

---

## 6. Antideploy Context

**Account (already connected, for reference only — NOT used for deploy):**
- Token: `~/.antideploy/config.json` (mode 0600, prefix `adu_w71...`)
- Account: `nika35093@gmail.com` (Google sign-in)
- **NOTE (2026-10-04): deployment will use a DIFFERENT Antideploy account — the nika token must NOT be used. Need the new account's token at `~/.antideploy/config.json` (or update it).**
- Existing apps on nika account: `finshield-frontend`, `finshield-backend`
- **Free plan impact:** 1 live app with server quota → already used twice → **deploying promptwars as server app will hit `402 live_app_limit`**. Must either upgrade (Go ₹399/mo = 3 apps) or re-classify as static, or free a slot.

**Antideploy rules relevant to this app:**
- Static sites (Vite `dist/` only, no server): **free forever, unlimited**
- Server app: needs `start` script + listens on `process.env.PORT` (Antideploy injects)
- Buildpacks detect Node 22 from `package.json` engines; Dockerfile at root takes precedence
- Secrets via `PUT /api/v1/secrets?applicationId=<id>` (write-only, never readable back)
- AI wallet: `POST /api/v1/ai/keys` creates `OPENROUTER_API_KEY` in app env; prepaid wallet (₹115 for ₹100 credit, 15% fee). Agent cannot top up — user must.
- Apps sleep when idle → first request after sleep: 2.9–13.9s wake
- `.antideploy.json` should hold `{applicationId, name}` once created — currently MISSING (app not created on Antideploy yet)

**Verified from sandbox:** `https://antideploy.com/api/v1` returns 200, no network block.

---

## 7. LLM Provider Strategy

**Provider (updated 2026-10-04):** apinex OpenRouter-compatible endpoint
- Base URL: `https://api.apinex.bond/v1`
- Key: `sk-apx4c0942017dbc530474e82158e5f9a0415918cf79cea498e` (in `/.env`, gitignored, mode 0600)
- **Model A** (Report + Steelman/Advocate): `free/gpt-6-luna`
- **Model B** (Skeptic + Rebuttal): `free/glm-5.3-flash`

**Fallbacks (older, still in code):** direct `GEMINI_API_KEY`, `OPENAI_API_KEY`

**Server env vars (`.env.example`):**
```
OPENROUTER_API_KEY=sk-apx4...           # apinex (in /home/yash/Downloads/PromptWars/.env)
OPENROUTER_BASE_URL=https://api.apinex.bond/v1
LLM_MODEL_A=free/gpt-6-luna             # Report + Advocate
LLM_MODEL_B=free/glm-5.3-flash          # Skeptic + Rebuttal
SITE_URL=https://promptwars.antideploy.app
PORT=3001
```

**Resilience added:** report generation retries once with stricter prompt on parse/validation failure; Zod preprocessing normalizes flavor/risk/node-type/numeric fields from the LLM output.

**Tested live:** `POST /api/scan` returns full report (5 assumptions, 3 biases, 5 socratic, 6 ripple nodes) + advocate (steelman) + skeptic (Dimara bias tags). Verified 2026-10-04.

**Key prompts (server/src/prompts.ts):**
- STEELMAN: 3 bullets why lean is RIGHT + 1 verify question, strict JSON
- SKEPTIC: MUST disagree with ≥2 assumptions, map to [Bias - Dimara Flavor] with quote, strict JSON
- REBUTTAL: Skeptic rebuts Advocate's points, 3 bullets
- REPORT: full blind-spot JSON (assumptions, biases, socratic, frames, experiments, premortems, ripples, confidenceNote)

---

## 8. Runtime Protocol

**WS (`/ws`):**
- Client → `scan:start {decision, reasoning, confidence}`
- Server → `hello`, `scan:started`, `report:delta`, `duel:advocate:delta`, `duel:skeptic:delta`, `scan:complete {report, duel}`, `error`
- Client → `rebuttal:run {advocate, decision, reasoning}`
- Server → `rebuttal:started`, `rebuttal:delta`, `rebuttal:complete {rebuttal}`

**REST fallback:**
- `POST /api/scan` → `{report, duel}`
- `POST /api/rebuttal` → `{rebuttal}`
- `GET /api/health` → `{ok, llm: {provider, configured}, uptime, ws}`

**Parallelism:** `runScan` + `runDuel` run in `Promise.all` — report + advocate + skeptic all stream concurrently. Gemini adapter fakes streaming (12-char chunks, 12ms). OpenRouter adapter streams natively.

---

## 9. Build / Run / Deploy Commands

```bash
npm install
npm run dev          # concurrently: vite (client :5173) + tsx watch server (:3001)
npm run dev:client   # vite only
npm run dev:server   # tsx watch server/src/index.ts only
npm run build        # tsc -b + vite build + tsc -p server/tsconfig.json
npm start            # node server/dist/index.js (serves dist/ + WS/REST)
```

**Fixed (2026-10-04):**
- `server/tsconfig.json` now overrides `noEmit: false`, `allowImportingTsExtensions: false`, `composite: false`, `incremental: false` → `server/dist/` builds correctly (index.js, ws.js, orchestrator.js, prompts.js, schemas.js, llm/*).
- Verified: `npm start` serves `dist/` on :3001, `GET /api/health` returns `{"ok":true,"llm":{"provider":"none","configured":false},...}`, static assets 200, Express 5 wildcard route replaced with `app.use` fallback (was crashing on path-to-regexp `*`).

---

## 10. Antideploy Deploy Plan (not yet executed)

1. Fix `server/tsconfig.json` noEmit bug → `npm run build` → verify `server/dist/index.js` exists
2. Create `.antideploy.json` via API: `POST /api/v1/applications {"name":"promptwars"}` → save `applicationId`
3. Set secrets: `PUT /api/v1/secrets?applicationId=<id>` `{OPENROUTER_API_KEY: "sk-or-..."}` (or provision via `POST /api/v1/ai/keys`)
4. Push: `tar czf - --exclude=.git --exclude=node_modules . | curl -X POST "https://antideploy.com/api/v1/deploy?applicationId=<id>" -H "Authorization: Bearer $TOKEN" -F "archive=@-"`
5. Poll `GET /api/v1/deployments/{taskId}` until `status: succeeded` → URL `https://promptwars.antideploy.app`
6. If `402 live_app_limit` → options: upgrade to Go plan, remove `finshield-*` from account (only via dashboard), or deploy as static site (no server, free) at cost of losing WS/REST

---

## 11. What's Done vs TODO

**Done:**
- [x] Full-stack scaffold: Vite + React 19 + Tailwind client, Express 5 + ws + zod server
- [x] Mock removed from runtime path; EXAMPLES retained in `engine/mock.ts` for demo buttons
- [x] Client WS hook + REST fallback wired in `App.tsx`
- [x] Server: express static, /api/health, /api/scan, /api/rebuttal, /ws orchestrator
- [x] OpenRouter streaming adapter + Gemini REST fallback
- [x] Zod schemas for all LLM outputs
- [x] Anti-sycophancy prompts (Steelman vs Skeptic vs Rebuttal vs Report)
- [x] Dockerfile + .dockerignore + .env.example
- [x] Vite proxy for /api and /ws → localhost:3001
- [x] Antideploy account confirmed connected, sandbox reachability confirmed

**TODO (next steps):**
- [x] **Fix `server/tsconfig.json`** — override `noEmit: false` (done; server/dist builds)
- [ ] Add `OPENROUTER_API_KEY` (via Antideploy `POST /api/v1/ai/keys`) to server/.env for local test
- [x] Run `npm start` locally → verified `GET /api/health` responds, static serves (LLM still unconfigured — needs key)
- [ ] Replace default Vite `README.md` with real README (problem statement, architecture, how to run, demo script)
- [ ] `git init`, commit, push to GitHub (required for submission)
- [ ] Handle Antideploy `live_app_limit` (upgrade, free slot, or go static)
- [ ] Deploy to Antideploy + verify live link + run security scan
- [ ] Record 45-sec demo: input → Scan → Report → Duel → Rebuttal → Premortem → "We never decide for you"

---

## 12. Demo Script (45 sec)

> "This is PRISM. You paste your reasoning — here's a student's internship case. PRISM never decides for you. It shows you unstated assumptions, biases like Halo Effect and Optimism Bias, Socratic questions you haven't asked, and small experiments to run. Two AIs then debate your reasoning — the Steelman defends it, the Skeptic attacks it with Dimara bias tags, and the Skeptic rebuts the Steelman. Finally, a premortem simulates three futures where you regret it, plus a ripple map of second-order consequences. Your job: think clearer, not outsource the choice."

---

## 13. Citations for Pitch / README

- Pronin, Emily et al. (2002), *The Bias Blind Spot*
- Dimara, Evanthia et al. (2020) — taxonomy of cognitive biases (5 flavors)
- Klein, Gary (2007), *Performing a Project Premortem*, HBR
- Heath, Chip & Dan (2013), *Decisive* — WRAP framework
- de Bono, Edward (1985) — Six Thinking Hats
- Sharma, Mrinank et al. (2024), *Towards Understanding Sycophancy in LLMs*
- Stanford HAI 2024 — Adversarial Collaboration with LLMs
- Farnam Street — Mental Models (Map ≠ Territory, Inversion, Second-Order)
