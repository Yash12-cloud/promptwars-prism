import { EXAMPLES } from '../engine/mock';
import type { ExampleCase } from '../engine/types';
import type { WSStatus } from '../hooks/usePrismWS';

export default function InputPanel(props: {
  decision: string;
  reasoning: string;
  confidence: number;
  setDecision: (v: string) => void;
  setReasoning: (v: string) => void;
  setConfidence: (v: number) => void;
  onScan: () => void;
  scanning: boolean;
  wsStatus: WSStatus;
  wsError: string | null;
}) {
  const { decision, reasoning, confidence, setDecision, setReasoning, setConfidence, onScan, scanning, wsStatus, wsError } = props;

  const canScan = reasoning.trim().length > 40 && decision.trim().length > 5;

  const applyExample = (ex: ExampleCase) => {
    setDecision(ex.decision);
    setReasoning(ex.reasoning);
    setConfidence(ex.confidence);
  };

  return (
    <div className="space-y-6">
      {/* Welcome heading — ChatGPT 24/600 */}
      <div className="space-y-2">
        <h1 className="text-[24px] font-semibold leading-[1.33] tracking-normal text-graphite-ink">Don&apos;t decide. See clearly.</h1>
        <p className="text-[16px] leading-[1.5] text-mid-ash max-w-[60ch]">
          Describe your lean and why. Two AIs debate it in parallel — the Steelman defends you, the Skeptic hunts blind spots — then the Skeptic rebuts the Steelman. We never decide for you.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => applyExample(ex)}
              className="inline-flex items-center gap-1.5 rounded-full bg-pure-white border border-hairline px-3 py-1 text-[14px] font-medium text-graphite-ink hover:bg-hover-veil transition"
            >
              <span aria-hidden>{ex.icon}</span> {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer — ChatGPT Surface Card */}
      <div className="rounded-cards bg-pure-white border border-hairline p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-hollow">Composer</span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              wsError ? 'bg-pure-white border-hairline text-graphite-ink' : wsStatus === 'ready' ? 'bg-sidebar-mist border-hairline text-graphite-ink' : 'bg-pure-white border-hairline text-hollow'
            }`}
          >
            {wsError ? 'WS error · REST fallback' : wsStatus === 'streaming' ? 'Streaming…' : wsStatus === 'ready' ? 'WS ready' : wsStatus === 'connecting' ? 'Connecting…' : 'Production · WS + REST'}
          </span>
        </div>

        <label className="block space-y-1" htmlFor="prism-decision">
          <span className="text-[14px] font-medium text-graphite-ink">Decision you&apos;re considering</span>
          <input
            id="prism-decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g. Whether to accept a 6-month internship…"
            autoComplete="off"
            className="w-full rounded-buttons border border-hairline bg-pure-white px-3 py-2 text-[14px] leading-[1.43] text-graphite-ink placeholder:text-hollow outline-none focus:border-edge-gray"
          />
        </label>

        <div className="space-y-1">
          <label className="flex items-center gap-2 text-[14px] font-medium text-graphite-ink" htmlFor="prism-reasoning">
            Your reasoning <span className="text-[12px] font-normal text-hollow">({reasoning.length} chars)</span>
          </label>
          <textarea
            id="prism-reasoning"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={6}
            aria-describedby="prism-reasoning-hint"
            placeholder="Why are you leaning that way? What matters most? Who influenced you? What doubts do you have?"
            className="w-full resize-none rounded-buttons border border-hairline bg-pure-white px-3 py-2.5 text-[14px] leading-[1.5] text-graphite-ink placeholder:text-hollow outline-none focus:border-edge-gray"
          />
          <span id="prism-reasoning-hint" className={`text-[12px] leading-[1.43] ${reasoning.trim().length < 40 ? 'text-hollow' : 'text-mid-ash'}`}>
            {reasoning.trim().length < 40 ? 'Add at least 40 characters for a useful scan.' : 'Good — enough context for a sharp debate.'}
          </span>
        </div>

        <div className="rounded-buttons bg-sidebar-mist border border-hairline p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[14px] font-medium text-graphite-ink" htmlFor="prism-confidence">How confident are you?</label>
            <span className="text-[12px] font-medium text-hollow tabular-nums" aria-hidden>{confidence}%</span>
          </div>
          <input id="prism-confidence" type="range" min={5} max={95} value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))} aria-valuetext={`${confidence} percent confident`} className="w-full accent-graphite-ink" />
          <div className="flex justify-between text-[11px] text-hollow">
            <span>Exploring</span>
            <span>Leaning</span>
            <span>Almost decided</span>
          </div>
        </div>

        {wsError && <p className="text-[13px] leading-[1.43] text-hollow">WS error: {wsError} — REST fallback will be used.</p>}

        <button
          disabled={!canScan || scanning}
          onClick={onScan}
          aria-busy={scanning}
          aria-live="polite"
          className="w-full inline-flex items-center justify-center gap-2 rounded-buttons bg-ink-press text-white text-[14px] font-medium h-10 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {scanning ? 'Scanning…' : 'Scan — start the debate'}
        </button>
        <p className="text-center text-[12px] leading-[1.43] text-hollow">Two models in parallel (A defends, B attacks), then B rebuts A.</p>
      </div>
    </div>
  );
}
