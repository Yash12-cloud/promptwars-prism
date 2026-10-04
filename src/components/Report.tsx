import type { AnalysisResult } from '../engine/types';

const flavorLabel: Record<string, string> = {
  Association: 'Association',
  Baseline: 'Baseline',
  Inertia: 'Inertia',
  Outcome: 'Outcome',
  'Self-Perspective': 'Self-Perspective',
};

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-cards bg-pure-white border border-hairline p-4">
      <div className="space-y-0.5">
        <div className="text-[14px] font-semibold leading-none text-graphite-ink">{title}</div>
        <div className="text-[13px] leading-[1.43] text-hollow">{subtitle}</div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

export default function Report({
  data,
  onCopy,
  onDownload,
}: {
  data: AnalysisResult;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Report header — Surface Card */}
      <div className="rounded-cards bg-pure-white border border-hairline p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-hollow">Blind Spot Report</div>
            <h2 className="mt-1 text-[24px] font-semibold leading-[1.33] text-graphite-ink">{data.title}</h2>
            <p className="mt-1 text-[14px] leading-[1.43] text-mid-ash max-w-[60ch]">{data.summary}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onCopy} className="rounded-full border border-hairline bg-pure-white px-4 h-8 text-[14px] font-medium text-graphite-ink hover:bg-hover-veil transition">
              Copy
            </button>
            <button
              onClick={onDownload}
              className="rounded-full bg-ink-press text-white px-4 h-8 text-[14px] font-medium hover:opacity-90 transition"
            >
              Print
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-buttons bg-sidebar-mist border border-hairline px-3 py-2.5 text-[13px] leading-[1.43] text-mid-ash">
          <span className="font-medium text-graphite-ink">Calibration:</span> {data.confidenceNote}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Unstated assumptions" subtitle="Test each before you decide.">
          {data.assumptions.map((a, i) => (
            <div key={i} className="rounded-buttons bg-sidebar-mist border border-hairline p-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-full border border-hairline bg-pure-white px-2 py-0.5 text-[11px] font-medium text-graphite-ink">
                  {flavorLabel[a.flavor] ?? a.flavor}
                </span>
                <span className="inline-flex items-center rounded-full border border-hairline bg-pure-white px-2 py-0.5 text-[11px] font-medium text-hollow">
                  {a.risk} risk
                </span>
              </div>
              <div className="mt-2 text-[14px] font-medium leading-[1.43] text-graphite-ink">{a.text}</div>
              <div className="mt-1 text-[13px] leading-[1.43] text-mid-ash">
                <span className="font-medium text-graphite-ink">Try:</span> {a.test}
              </div>
            </div>
          ))}
        </Card>

        <Card title="Bias lens" subtitle="Dimara 5 flavors — perspectives, not accusations.">
          <div className="space-y-3">
            {data.biases.map((b, i) => (
              <div key={i} className="rounded-buttons bg-pure-white border border-hairline p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[14px] font-semibold text-graphite-ink">{b.name}</span>
                  <span className="inline-flex items-center rounded-full border border-hairline bg-sidebar-mist px-2 py-0.5 text-[11px] font-medium text-hollow">
                    {flavorLabel[b.flavor] ?? b.flavor}
                  </span>
                </div>
                <div className="mt-1 text-[13px] leading-[1.43] text-hollow">Evidence: &ldquo;{b.quote}&rdquo;</div>
                <div className="mt-1 text-[13px] leading-[1.43] text-mid-ash">{b.explain}</div>
              </div>
            ))}
            <p className="border-t border-hairline pt-3 text-[12px] leading-[1.43] text-hollow">
              Pronin 2002 · Dimara et al. · Sharma 2024
            </p>
          </div>
        </Card>

        <Card title="Unasked questions" subtitle="Socratic — answer for yourself, don&apos;t outsource.">
          <ol className="space-y-2">
            {data.socratic.map((q, i) => (
              <li key={i} className="flex gap-3 rounded-buttons bg-sidebar-mist border border-hairline px-3 py-2.5">
                <span className="w-6 h-6 shrink-0 rounded-full bg-ink-press text-white grid place-items-center text-[11px] font-semibold leading-none">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-[1.43] text-graphite-ink">{q}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card title="Reframe the question" subtitle="Widen options, not just weights.">
            <div className="space-y-2">
              {data.frames.map((f, i) => (
                <div key={i} className="rounded-buttons bg-pure-white border border-hairline px-3 py-3">
                  <div className="text-[14px] font-medium text-graphite-ink">{f.title}</div>
                  <div className="text-[13px] leading-[1.43] text-mid-ash">{f.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Small experiments" subtitle="30 min → 1 day tests before you commit.">
            <div className="space-y-2">
              {data.experiments.map((e, i) => (
                <div key={i} className="rounded-buttons bg-pure-white border border-hairline p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-graphite-ink">{e.title}</span>
                    <span className="inline-flex items-center rounded-full border border-hairline bg-sidebar-mist px-2 py-0.5 text-[11px] font-medium text-hollow">
                      {e.time}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] leading-[1.43] text-mid-ash">{e.desc}</div>
                  <label className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-mid-ash cursor-pointer">
                    <input type="checkbox" className="accent-graphite-ink" /> Mark done
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="rounded-cards bg-pure-white border border-hairline px-4 py-3 text-[13px] leading-[1.43] text-mid-ash">
        <span className="font-medium text-graphite-ink">We do not decide for you.</span> Use the experiments, then re-scan.
      </div>
    </div>
  );
}
