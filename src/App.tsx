import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import Report from './components/Report';
import Duel from './components/Duel';
import Premortem from './components/Premortem';
import { EXAMPLES } from './engine/mock';
import { usePrismWS } from './hooks/usePrismWS';
import type { AnalysisResult, DuelPayload } from './engine/types';

type Tab = 'report' | 'duel' | 'premortem';

export default function App() {
  const [decision, setDecision] = useState(EXAMPLES[0].decision);
  const [reasoning, setReasoning] = useState(EXAMPLES[0].reasoning);
  const [confidence, setConfidence] = useState(EXAMPLES[0].confidence);
  const [activeExample, setActiveExample] = useState<string | null>(EXAMPLES[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [duel, setDuel] = useState<DuelPayload | null>(null);
  const [tab, setTab] = useState<Tab>('report');
  const [rebutting, setRebutting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status: wsStatus, error: wsError, setError: setWsError, connect, ensureHandlers, wsRef } = usePrismWS();

  const handleSelectExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setDecision(ex.decision);
    setReasoning(ex.reasoning);
    setConfidence(ex.confidence);
    setActiveExample(id);
    setMobileNavOpen(false);
  };

  const runScanViaWs = async () => {
    const ws = await connect();
    return new Promise<{ report: AnalysisResult; duel: DuelPayload }>((resolve, reject) => {
      let settled = false;
      ensureHandlers(ws, {
        onComplete: (msg) => {
          if (!settled) {
            settled = true;
            resolve({ report: msg.report, duel: msg.duel });
          }
        },
        onError: (msg) => {
          if (!settled) {
            settled = true;
            reject(new Error(msg.message || 'WS error'));
          }
        },
        onReportDelta: () => {},
        onAdvDelta: () => {},
        onSkepDelta: () => {},
      });
      ws.send(JSON.stringify({ type: 'scan:start', decision, reasoning, confidence }));
      setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('Scan timeout (30s)'));
        }
      }, 30000);
    });
  };

  const runScanViaRest = async () => {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reasoning, confidence }),
    });
    if (!res.ok) throw new Error(`REST ${res.status}: ${await res.text()}`);
    return res.json() as Promise<{ report: AnalysisResult; duel: { advocate: any; skeptic: any } }>;
  };

  const onScan = async () => {
    setError(null);
    setWsError(null);
    setScanning(true);
    try {
      let data: { report: AnalysisResult; duel: any };
      try {
        data = await runScanViaWs();
      } catch (e: any) {
        console.warn('[PRISM] WS failed, falling back to REST', e.message);
        data = (await runScanViaRest()) as any;
      }
      setResult(data.report);
      setDuel({ advocate: data.duel.advocate, skeptic: data.duel.skeptic, rebuttal: (data.duel as any).rebuttal });
      setTab('report');
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setScanning(false);
    }
  };

  const onRebuttal = async () => {
    if (!duel) return;
    setRebutting(true);
    setError(null);
    try {
      try {
        const ws = wsRef.current && wsRef.current.readyState === 1 ? wsRef.current : await connect();
        const rebuttal = await new Promise<{ rebuttal: string[] }>((resolve, reject) => {
          let done = false;
          ensureHandlers(ws, {
            onRebuttalComplete: (msg) => {
              if (!done) {
                done = true;
                resolve({ rebuttal: msg.rebuttal });
              }
            },
            onError: (msg) => {
              if (!done) {
                done = true;
                reject(new Error(msg.message));
              }
            },
            onRebuttalDelta: () => {},
          });
          ws.send(JSON.stringify({ type: 'rebuttal:run', advocate: duel.advocate, decision, reasoning }));
          setTimeout(() => {
            if (!done) {
              done = true;
              reject(new Error('Rebuttal timeout'));
            }
          }, 20000);
        });
        setDuel((prev) => (prev ? { ...prev, rebuttal: rebuttal.rebuttal } : prev));
      } catch {
        const res = await fetch('/api/rebuttal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advocate: duel.advocate, decision, reasoning }),
        });
        if (!res.ok) throw new Error(await res.text());
        const j = await res.json();
        setDuel((prev) => (prev ? { ...prev, rebuttal: j.rebuttal } : prev));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRebutting(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const txt = `# ${result.title}\n${result.summary}\n\n## Assumptions\n${result.assumptions.map((a) => `- [${a.flavor}/${a.risk}] ${a.text} → ${a.test}`).join('\n')}\n\n## Biases\n${result.biases.map((b) => `- ${b.name} (${b.flavor}): "${b.quote}" — ${b.explain}`).join('\n')}\n\n## Socratic\n${result.socratic.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n## Experiments\n${result.experiments.map((e) => `- ${e.title} (${e.time}): ${e.desc}`).join('\n')}\n`;
    await navigator.clipboard.writeText(txt);
  };

  const reset = () => {
    setResult(null);
    setDuel(null);
    setTab('report');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-pure-white text-graphite-ink flex">
      {/* Sidebar — desktop */}
      <Sidebar onSelectExample={handleSelectExample} onNewScan={reset} hasResult={!!result} activeExample={activeExample} />

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" onClick={() => setMobileNavOpen(false)} className="absolute inset-0 bg-deep-charcoal" />
          <div className="relative h-full w-[280px] bg-sidebar-mist border-r border-hairline flex flex-col">
            <Sidebar onSelectExample={handleSelectExample} onNewScan={reset} hasResult={!!result} activeExample={activeExample} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onReset={reset} hasResult={!!result} />
        {/* Mobile menu button row */}
        <div className="lg:hidden border-b border-hairline bg-pure-white px-4 h-9 flex items-center">
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="rounded-nav border border-hairline bg-pure-white px-3 py-1 text-[13px] font-medium text-graphite-ink hover:bg-hover-veil"
          >
            {mobileNavOpen ? 'Close' : 'Examples'}
          </button>
          <span className="ml-3 text-[12px] text-hollow truncate">Two AIs · same input, opposite prompts · WS /ws → REST fallback</span>
        </div>

        <main className="mx-auto w-full max-w-[768px] px-4 py-6 sm:py-8 space-y-6">
          <InputPanel
            decision={decision}
            reasoning={reasoning}
            confidence={confidence}
            setDecision={(v) => {
              setDecision(v);
              setActiveExample(null);
            }}
            setReasoning={(v) => {
              setReasoning(v);
              setActiveExample(null);
            }}
            setConfidence={setConfidence}
            onScan={onScan}
            scanning={scanning}
            wsStatus={wsStatus}
            wsError={wsError}
          />

          {error && (
            <div className="rounded-cards bg-pure-white border border-hairline p-4">
              <div className="text-[14px] font-medium text-graphite-ink">AI error</div>
              <p className="mt-1 text-[13px] leading-[1.43] text-mid-ash break-words">{error}</p>
              <p className="mt-1 text-[12px] leading-[1.43] text-hollow">Set OPENROUTER_API_KEY in server env. REST fallback is automatic if WS fails.</p>
            </div>
          )}

          {result && (
            <div id="results" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-hairline" />
                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-hollow px-2">Your blind spot report — live AI</span>
                <div className="h-px flex-1 bg-hairline" />
              </div>

              <div className="flex gap-1.5 p-1 rounded-full border border-hairline bg-pure-white w-fit">
                {(['report', 'duel', 'premortem'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium capitalize transition ${tab === t ? 'bg-ink-press text-white' : 'text-hollow hover:text-graphite-ink hover:bg-hover-veil'}`}
                  >
                    {t === 'report' ? 'Report' : t === 'duel' ? 'Duel — 2 AIs' : 'Premortem + Ripples'}
                  </button>
                ))}
              </div>

              {tab === 'report' && <Report data={result} onCopy={handleCopy} onDownload={() => window.print()} />}
              {tab === 'duel' && <Duel data={duel} onRebuttal={onRebuttal} rebutting={rebutting} />}
              {tab === 'premortem' && <Premortem data={result.premortems} ripples={result.ripples} />}

              <div className="rounded-cards bg-sidebar-mist border border-hairline px-4 py-3 text-[12px] leading-[1.43] text-hollow">
                Server WS at <code className="rounded border border-hairline bg-pure-white px-1 py-0.5 text-[11px]">/ws</code> streams{' '}
                <code className="rounded border border-hairline bg-pure-white px-1 py-0.5 text-[11px]">duel:advocate:delta</code> +{' '}
                <code className="rounded border border-hairline bg-pure-white px-1 py-0.5 text-[11px]">duel:skeptic:delta</code> in parallel. REST{' '}
                <code className="rounded border border-hairline bg-pure-white px-1 py-0.5 text-[11px]">/api/scan</code> is fallback.
              </div>
            </div>
          )}

          <footer className="border-t border-hairline pt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] leading-[1.43] text-hollow">
            <span>PRISM — Thought partner, not oracle. Keys never touch the browser.</span>
            <span className="inline-flex gap-1.5">
              <span className="rounded-full border border-hairline bg-pure-white px-2.5 py-1">WS /ws</span>
              <span className="rounded-full border border-hairline bg-pure-white px-2.5 py-1">REST /api/scan</span>
            </span>
          </footer>
        </main>
      </div>

      <style>{`@media print { header, footer, button { display:none !important } }`}</style>
    </div>
  );
}
