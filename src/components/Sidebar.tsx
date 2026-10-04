import { EXAMPLES } from '../engine/mock';

export default function Sidebar({
  onSelectExample,
  onNewScan,
  hasResult,
  activeExample,
}: {
  onSelectExample: (id: string) => void;
  onNewScan: () => void;
  hasResult: boolean;
  activeExample: string | null;
}) {
  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col bg-sidebar-mist border-r border-hairline">
      {/* Header strip 52px */}
      <div className="h-[52px] shrink-0 flex items-center justify-between px-[10px] border-b border-hairline">
        <button onClick={onNewScan} className="flex items-center gap-2 rounded-nav px-[10px] py-[6px] hover:bg-hover-veil transition">
          <span className="w-6 h-6 rounded-[6px] bg-ink-press text-white grid place-items-center text-[11px] font-semibold leading-none">◐</span>
          <span className="text-[14px] font-semibold text-graphite-ink tracking-tight">PRISM</span>
          <span className="hidden xl:inline text-[11px] font-medium text-hollow border border-hairline rounded-full px-2 py-0.5">THE BLIND SPOT</span>
        </button>
        <button
          onClick={onNewScan}
          aria-label="New scan"
          className="w-8 h-8 grid place-items-center rounded-buttons hover:bg-hover-veil text-graphite-ink transition"
          title="New scan"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable history */}
      <div className="flex-1 overflow-auto px-2 py-3 space-y-4">
        <div className="px-2 space-y-1">
          <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-hollow">Examples</div>
          <p className="text-[13px] leading-[1.43] text-hollow">Tap to prefill the composer. Replace with your own reasoning.</p>
        </div>

        <div className="space-y-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelectExample(ex.id)}
              className={`w-full text-left rounded-nav px-[10px] py-[8px] transition border ${
                activeExample === ex.id
                  ? 'bg-pure-white border-hairline'
                  : 'bg-transparent border-transparent hover:bg-hover-veil'
              }`}
            >
              <div className="text-[14px] font-medium leading-[1.43] text-graphite-ink truncate">{ex.label}</div>
              <div className="text-[13px] leading-[1.43] text-hollow truncate">{ex.decision.slice(0, 48)}…</div>
            </button>
          ))}
        </div>

        <div className="px-2 pt-2 space-y-2">
          <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-hollow">How it works</div>
          <ol className="space-y-2 text-[13px] leading-[1.43] text-mid-ash">
            <li className="flex gap-2"><span className="text-hollow">1.</span> Describe your lean + reasons</li>
            <li className="flex gap-2"><span className="text-hollow">2.</span> AI maps assumptions, biases + questions</li>
            <li className="flex gap-2"><span className="text-hollow">3.</span> Premortem + ripple map the futures</li>
          </ol>
          <p className="text-[12px] leading-[1.43] text-hollow">Single model · REST /api/scan</p>
        </div>
      </div>

      {/* Footer block */}
      <div className="shrink-0 border-t border-hairline p-3 space-y-3">
        {hasResult && (
          <button
            onClick={onNewScan}
            className="w-full rounded-full bg-pure-white border border-hairline text-graphite-ink text-[14px] font-medium py-2 hover:bg-hover-veil transition"
          >
            New scan
          </button>
        )}
        <div className="space-y-1">
          <div className="text-[13px] font-medium text-graphite-ink leading-[1.43]">Thought partner, not oracle</div>
          <p className="text-[13px] leading-[1.43] text-hollow">We never decide for you. We surface what you haven&apos;t questioned.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-hollow">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-graphite-ink" /> REST</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-edge-gray" /> no VITE_ keys</span>
        </div>
      </div>
    </aside>
  );
}
