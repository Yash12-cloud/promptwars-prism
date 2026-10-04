import type { AnalysisResult } from '../engine/types';

export default function Premortem({
  data,
  ripples,
}: {
  data: AnalysisResult['premortems'];
  ripples: AnalysisResult['ripples'];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-cards bg-pure-white border border-hairline p-4">
        <div className="space-y-1">
          <div className="text-[14px] font-semibold text-graphite-ink">Premortem simulator</div>
          <p className="text-[13px] leading-[1.43] text-hollow">It&apos;s 6 months later and you deeply regret it. Which story came true? (Klein, HBR 2007)</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {data.map((p, i) => (
            <div key={i} className="rounded-buttons bg-sidebar-mist border border-hairline p-3 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-medium text-graphite-ink">{p.title}</span>
                <span className="shrink-0 inline-flex items-center rounded-full border border-hairline bg-pure-white px-2 py-0.5 text-[11px] font-medium text-hollow">
                  {p.prob}
                </span>
              </div>
              <p className="mt-2 flex-1 text-[13px] leading-[1.43] text-mid-ash">{p.story}</p>
              <button className="mt-3 self-start rounded-full border border-hairline bg-pure-white px-3 py-1 text-[13px] font-medium text-graphite-ink hover:bg-hover-veil transition">
                This would hurt most
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-cards bg-pure-white border border-hairline p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[14px] font-semibold text-graphite-ink">Ripple map — second-order consequences</div>
            <p className="text-[13px] leading-[1.43] text-hollow">First → second → third order. What you haven&apos;t priced yet.</p>
          </div>
          <span className="text-[12px] text-hollow">Map ≠ Territory</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-buttons bg-sidebar-mist border border-hairline">
          <svg viewBox="0 0 100 100" className="w-full h-[280px] sm:h-[340px]">
            {ripples.edges.map(([a, b], i) => {
              const na = ripples.nodes.find((n) => n.id === a)!;
              const nb = ripples.nodes.find((n) => n.id === b)!;
              return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(0,0,0,0.10)" strokeWidth={0.9} />;
            })}
            {ripples.nodes.map((n) => {
              const fill = n.type === 'decision' ? '#000000' : n.type === 'first' ? '#0d0d0d' : n.type === 'second' ? '#5d5d5d' : '#8f8f8f';
              return (
                <g key={n.id}>
                  <rect x={n.x - 12} y={n.y - 6} rx={5} ry={5} width={24} height={12} fill={fill} />
                  <text x={n.x} y={n.y + 1} textAnchor="middle" fontSize={2.5} fontWeight={600} fill="#ffffff">
                    {n.label.slice(0, 14)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[12px] leading-[1.43] text-hollow">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-ink-press" /> Decision
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-graphite-ink" /> First-order
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-mid-ash" /> Second-order
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-hollow" /> Third-order
          </span>
        </div>
      </div>
    </div>
  );
}
