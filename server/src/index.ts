import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { attachWsHandler } from './ws.js';
import { runScan, runDuel, runRebuttal } from './orchestrator.js';
import { llmStatus } from './llm/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const ALLOWED_ORIGINS = [process.env.SITE_URL, 'http://localhost:5173', 'http://localhost:3001'].filter(Boolean) as string[];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl / health checks
    if (ALLOWED_ORIGINS.some((o) => origin === o || origin.endsWith('.antideploy.app'))) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'));
  },
}));
app.use(express.json({ limit: '1mb' }));

// Health
app.get('/api/health', (_req, res) => {
  const llm = llmStatus();
  res.json({ ok: true, llm, uptime: process.uptime(), ws: '/ws' });
});

// REST fallback for non-WS clients (also used for simple testing)
app.post('/api/scan', async (req, res) => {
  try {
    const { decision, reasoning, confidence } = req.body;
    if (!reasoning) return res.status(400).json({ error:'reasoning required' });
    const [report, duel] = await Promise.all([
      runScan(decision||'', reasoning, confidence||70),
      runDuel(decision||'', reasoning, confidence||70),
    ]);
    res.json({ report, duel: { advocate: duel.advocate, skeptic: duel.skeptic } });
  } catch (e:any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/rebuttal', async (req, res) => {
  try {
    const { advocate, decision, reasoning } = req.body;
    const r = await runRebuttal(advocate, decision||'', reasoning||'');
    res.json(r);
  } catch (e:any) { res.status(500).json({ error: e.message }); }
});

// Static client (after building dist/)
const clientDist = path.resolve(__dirname, '../../dist');
app.use(express.static(clientDist));
app.use((_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).send('Not found — did you run vite build?');
  });
});

// WS
const server = createServer(app);
const wss = new WebSocketServer({
  server,
  path: '/ws',
  verifyClient: (info, done) => {
    const origin = info.origin || info.req.headers.origin;
    if (!origin) return done(true); // same-origin / non-browser
    if (ALLOWED_ORIGINS.some((o) => origin === o || origin.endsWith('.antideploy.app'))) return done(true);
    return done(false, 403, 'Origin not allowed');
  },
});

wss.on('connection', (ws) => {
  console.log('[ws] client connected');
  attachWsHandler(ws, {
    async onScan(decision, reasoning, confidence, emit) {
      // report and duel in parallel, collecting deltas
      const [report, duel] = await Promise.all([
        runScan(decision, reasoning, confidence, emit.reportDelta),
        runDuel(decision, reasoning, confidence, emit.duelAdvDelta, emit.duelSkepDelta),
      ]);
      return { report, duel };
    },
    async onRebuttal(advocate, decision, reasoning, onDelta) {
      return runRebuttal(advocate, decision, reasoning, onDelta);
    }
  });
  ws.on('close', ()=> console.log('[ws] client disconnected'));
});

const PORT = parseInt(process.env.PORT || '3001', 10);
server.listen(PORT, () => {
  const llm = llmStatus();
  console.log(`[PRISM] listening on :${PORT}`);
  console.log(`[PRISM] client dist: ${clientDist}`);
  console.log(`[PRISM] LLM: ${llm.provider} configured=${llm.configured}`);
  if (!llm.configured) console.log('[PRISM] WARNING: No OPENROUTER_API_KEY / GEMINI_API_KEY set — WS will error on scan. Set via Antideploy secrets or server/.env');
});
