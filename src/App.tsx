import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import Report from './components/Report';
import Premortem from './components/Premortem';
import { EXAMPLES } from './engine/mock';
import type { AnalysisResult } from './engine/types';

type Tab = 'report' | 'premortem';

export default function App() {
  const [decision, setDecision] = useState(EXAMPLES[0].decision);
  const [reasoning, setReasoning] = useState(EXAMPLES[0].reasoning);
  const [confidence, setConfidence] = useState(EXAMPLES[0].confidence);
  const [activeExample, setActiveExample] = useState<string | null>(EXAMPLES[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [tab, setTab] = useState<Tab>('report');
  const [error, setError] = useState<string | null>(null);

  const handleSelectExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setDecision(ex.decision);
    setReasoning(ex.reasoning);
    setConfidence(ex.confidence);
    setActiveExample(id);
    setMobileNavOpen(false);
  };

  const onScan = async () => {
    setError(null);
    setScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reasoning, confidence }),
      });
      if (!res.ok) throw new Error(`Scan failed (${res.status}): ${await res.text()}`);
      const data = (await res.json()) as { report: AnalysisResult };
      setResult(data.report);
      setTab('report');
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setScanning(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const txt = `# ${result.title}\n${result.summary}\n\n## Assumptions\n${result.assumptions.map((a) => `- [${a.flavor}/${a.risk}] ${a.text} → ${a.test}`).join('\n')}\n\n## Biases\n${result.biases.map((b) => `- ${b.name} (${b.flavor}): "${b.quote}" — ${b.explain}`).join('\n')}\n\n## Socratic\n${result.socratic.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n## Experiments\n${result.experiments.map((e) => `- ${e.title} (${e.time}): ${e.desc}`).join('\n')}\n`;
    await navigator.clipboard.writeText(txt);
  };

  const reset = () => {
    setResult(null);
    setTab('report');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-pure-white text-graphite-ink flex">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {/* Sidebar — desktop */}
      <Sidebar onSelectExample={handleSelectExample} onNewScan={reset} hasResult={!!result} activeExample={activeExample} />

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Examples menu">
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
          <span className="ml-3 text-[12px] text-hollow truncate">Single-model analysis · REST /api/scan</span>
        </div>

        <main id="main-content" className="mx-auto w-full max-w-[768px] px-4 py-6 sm:py-8 space-y-6">
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
          />

          {error && (
            <div className="rounded-cards bg-pure-white border border-hairline p-4" role="alert">
              <div className="text-[14px] font-medium text-graphite-ink">AI error</div>
              <p className="mt-1 text-[13px] leading-[1.43] text-mid-ash break-words">{error}</p>
              <p className="mt-1 text-[12px] leading-[1.43] text-hollow">Set OPENROUTER_API_KEY in server env (Antideploy secrets or .env).</p>
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
                {(['report', 'premortem'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium capitalize transition ${tab === t ? 'bg-ink-press text-white' : 'text-hollow hover:text-graphite-ink hover:bg-hover-veil'}`}
                  >
                    {t === 'report' ? 'Report' : 'Premortem + Ripples'}
                  </button>
                ))}
              </div>

              {tab === 'report' && <Report data={result} onCopy={handleCopy} onDownload={() => window.print()} />}
              {tab === 'premortem' && <Premortem data={result.premortems} ripples={result.ripples} />}

              <div className="rounded-cards bg-sidebar-mist border border-hairline px-4 py-3 text-[12px] leading-[1.43] text-hollow">
                One model analyzes your reasoning end-to-end via <code className="rounded border border-hairline bg-pure-white px-1 py-0.5 text-[11px]">POST /api/scan</code>. Keys live server-side only.
              </div>
            </div>
          )}

          <footer className="border-t border-hairline pt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] leading-[1.43] text-hollow">
            <span>PRISM — Thought partner, not oracle. Keys never touch the browser.</span>
            <span className="inline-flex gap-1.5">
              <span className="rounded-full border border-hairline bg-pure-white px-2.5 py-1">REST /api/scan</span>
            </span>
          </footer>
        </main>
      </div>

      <style>{`@media print { header, footer, button { display:none !important } }`}</style>
    </div>
  );
}
