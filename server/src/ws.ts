import type { WebSocket } from 'ws';

type ClientMsg =
  | { type: 'scan:start'; decision: string; reasoning: string; confidence: number }
  | { type: 'rebuttal:run'; advocate: { points: string[]; verify: string }; decision: string; reasoning: string };

function send(ws: WebSocket, obj: any) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

export function attachWsHandler(
  ws: WebSocket,
  handlers: {
    onScan: (decision: string, reasoning: string, confidence: number, emit: { reportDelta(d:string):void; duelAdvDelta(d:string):void; duelSkepDelta(d:string):void; }) => Promise<{ report: any; duel: any }>;
    onRebuttal: (advocate: any, decision: string, reasoning: string, onDelta:(d:string)=>void) => Promise<any>;
  }
) {
  ws.on('message', async (raw) => {
    let msg: ClientMsg;
    try { msg = JSON.parse(raw.toString()); } catch { send(ws, { type:'error', code:'bad_json', message:'Invalid JSON' }); return; }

    try {
      if (msg.type === 'scan:start') {
        const { decision, reasoning, confidence } = msg;
        if (!reasoning || reasoning.trim().length < 20) { send(ws, { type:'error', code:'too_short', message:'Reasoning too short (min 20 chars)' }); return; }
        send(ws, { type:'scan:started' });

        // Run report + duel in parallel, streaming deltas
        const result = await handlers.onScan(decision, reasoning, confidence, {
          reportDelta: (d) => send(ws, { type:'report:delta', delta: d }),
          duelAdvDelta: (d) => send(ws, { type:'duel:advocate:delta', delta: d }),
          duelSkepDelta: (d) => send(ws, { type:'duel:skeptic:delta', delta: d }),
        });

        send(ws, { type:'scan:complete', report: result.report, duel: { advocate: result.duel.advocate, skeptic: result.duel.skeptic } });
      } else if (msg.type === 'rebuttal:run') {
        send(ws, { type:'rebuttal:started' });
        const res = await handlers.onRebuttal(msg.advocate, msg.decision, msg.reasoning, (d)=> send(ws, { type:'rebuttal:delta', delta: d }));
        send(ws, { type:'rebuttal:complete', rebuttal: res.rebuttal });
      } else {
        send(ws, { type:'error', code:'unknown_type', message:`Unknown type ${(msg as any).type}` });
      }
    } catch (e:any) {
      send(ws, { type:'error', code:'llm_error', message: e.message || String(e) });
    }
  });

  send(ws, { type:'hello', message:'PRISM WS ready. Send scan:start or rebuttal:run' });
}
