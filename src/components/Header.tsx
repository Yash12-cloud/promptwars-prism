export default function Header({ onReset, hasResult }: { onReset: () => void; hasResult: boolean }) {
  return (
    <header className="sticky top-0 z-10 bg-pure-white border-b border-hairline">
      <div className="mx-auto max-w-[768px] px-4 h-[52px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-[6px] bg-ink-press text-white grid place-items-center text-[11px] font-semibold leading-none shrink-0 lg:hidden">◐</span>
          <span className="text-[14px] font-semibold text-graphite-ink truncate">PRISM</span>
          <span className="hidden sm:inline text-[12px] text-hollow truncate">The Blind Spot · two AIs debate your reasoning</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasResult && (
            <button
              onClick={onReset}
              className="rounded-full bg-pure-white border border-hairline px-4 text-[14px] font-medium leading-none h-8 hover:bg-hover-veil text-graphite-ink transition"
            >
              New scan
            </button>
          )}
          <span className="hidden md:inline text-[12px] text-hollow">Never decides for you</span>
        </div>
      </div>
    </header>
  );
}
