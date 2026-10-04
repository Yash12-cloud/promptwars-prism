import { useCallback, useRef, useState } from 'react';

export type WSStatus = 'idle'|'connecting'|'ready'|'streaming'|'error';

export function usePrismWS() {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WSStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // streaming buffers
  const [reportDeltas, setReportDeltas] = useState<string>('');
  const [advDeltas, setAdvDeltas] = useState<string>('');
  const [skepDeltas, setSkepDeltas] = useState<string>('');
  const [rebuttalDeltas, setRebuttalDeltas] = useState<string>('');

  const connect = useCallback((): Promise<WebSocket> => {
    if (wsRef.current && wsRef.current.readyState === 1) return Promise.resolve(wsRef.current);
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${proto}//${location.host}/ws`;
    setStatus('connecting');
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      const t = setTimeout(()=> { ws.close(); reject(new Error('WS connect timeout')); }, 7000);
      ws.onopen = () => { clearTimeout(t); wsRef.current = ws; setStatus('ready'); resolve(ws); };
      ws.onerror = () => { clearTimeout(t); setStatus('error'); reject(new Error('WS failed — server may be sleeping. Retry.')); };
    });
  }, []);

  const ensureHandlers = useCallback((ws: WebSocket, handlers: {
    onReportDelta?: (d:string)=>void;
    onAdvDelta?: (d:string)=>void;
    onSkepDelta?: (d:string)=>void;
    onRebuttalDelta?: (d:string)=>void;
    onComplete?: (msg:any)=>void;
    onRebuttalComplete?: (msg:any)=>void;
    onError?: (msg:any)=>void;
  }) => {
    ws.onmessage = (ev) => {
      let msg: any; try { msg = JSON.parse(ev.data); } catch { return; }
      switch (msg.type) {
        case 'report:delta': handlers.onReportDelta?.(msg.delta); break;
        case 'duel:advocate:delta': handlers.onAdvDelta?.(msg.delta); break;
        case 'duel:skeptic:delta': handlers.onSkepDelta?.(msg.delta); break;
        case 'rebuttal:delta': handlers.onRebuttalDelta?.(msg.delta); break;
        case 'scan:complete': handlers.onComplete?.(msg); break;
        case 'rebuttal:complete': handlers.onRebuttalComplete?.(msg); break;
        case 'error': handlers.onError?.(msg); break;
        default: break;
      }
    };
  }, []);

  return { status, setStatus, error, setError, connect, ensureHandlers, wsRef, reportDeltas, setReportDeltas, advDeltas, setAdvDeltas, skepDeltas, setSkepDeltas, rebuttalDeltas, setRebuttalDeltas };
}
