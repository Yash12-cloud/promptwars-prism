import type { DuelPayload } from '../engine/types';

function Avatar({ label }: { label: string }) {
  return (
    <div className="w-7 h-7 shrink-0 rounded-full bg-ink-press text-white grid place-items-center text-[11px] font-semibold leading-none">
      {label}
    </div>
  );
}

function MessageCard({
  avatar,
  name,
  meta,
  children,
}: {
  avatar: string;
  name: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-cards bg-pure-white border border-hairline p-4">
      <div className="flex items-start gap-3">
        <Avatar label={avatar} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-graphite-ink leading-none">{name}</span>
            <span className="text-[12px] text-hollow leading-none">{meta}</span>
          </div>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Duel({
  data,
  onRebuttal,
  rebutting,
}: {
  data: DuelPayload | null;
  onRebuttal: () => void;
  rebutting: boolean;
}) {
  if (!data) {
    return (
      <div className="rounded-cards bg-pure-white border border-hairline border-dashed p-8 text-center">
        <div className="text-[14px] font-medium text-graphite-ink">Duel not yet run</div>
        <div className="text-[13px] leading-[1.43] text-hollow mt-1">Run a scan — the Steelman and the Skeptic answer in parallel on /ws.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* System notice */}
      <div className="rounded-cards bg-sidebar-mist border border-hairline px-3 py-2 text-[12px] leading-[1.43] text-hollow">
        Two models received the same prompt in parallel. Advocate runs at temp 0.7 to steelman you; Skeptic at 0.9 to break sycophancy. Then Skeptic rebuts the Advocate.
      </div>

      {/* Thread */}
      <div className="space-y-3">
        {/* Advocate */}
        <MessageCard avatar="A" name="Advocate · Steelman" meta="free/gpt-6-luna · temp 0.7">
          <ol className="space-y-2">
            {data.advocate.points.map((p, i) => (
              <li key={i} className="rounded-buttons border border-hairline bg-sidebar-mist px-3 py-2.5 text-[14px] leading-[1.5] text-graphite-ink">
                <span className="text-hollow mr-2 text-[12px]">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ol>
          <div className="rounded-buttons border border-hairline bg-pure-white px-3 py-2.5 text-[13px] leading-[1.43] text-mid-ash">
            <span className="font-medium text-graphite-ink">Verify:</span> {data.advocate.verify}
          </div>
        </MessageCard>

        {/* VS divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-hollow px-2">VS · same input, opposite system prompts</span>
          <div className="h-px flex-1 bg-hairline" />
        </div>

        {/* Skeptic */}
        <MessageCard avatar="S" name="Skeptic · Blind Spot Hunter" meta="free/glm-5.3-flash · temp 0.9 · anti-sycophancy">
          <ol className="space-y-2">
            {data.skeptic.points.map((p, i) => (
              <li key={i} className="rounded-buttons border border-hairline bg-pure-white px-3 py-2.5 text-[14px] leading-[1.5] text-graphite-ink">
                <span className="text-hollow mr-2 text-[12px]">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ol>
          {data.skeptic.questions.length > 0 && (
            <div className="space-y-2">
              {data.skeptic.questions.map((q, i) => (
                <div key={i} className="rounded-buttons border border-hairline bg-sidebar-mist px-3 py-2.5 text-[13px] leading-[1.43] text-mid-ash">
                  <span className="font-medium text-graphite-ink">Socratic {i + 1}:</span> {q}
                </div>
              ))}
            </div>
          )}
        </MessageCard>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onRebuttal}
          disabled={rebutting}
          className="rounded-full bg-ink-press text-white text-[14px] font-medium px-4 h-9 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {rebutting ? 'Rebutting…' : data.rebuttal ? 'Regenerate rebuttal' : 'Run rebuttal — Skeptic attacks Advocate'}
        </button>
        <span className="text-[12px] leading-[1.43] text-hollow">Orchestrated on server: Skeptic sees Advocate&apos;s JSON, then streams rebuttal via /ws.</span>
      </div>

      {/* Rebuttal */}
      {data.rebuttal && (
        <MessageCard avatar="S" name="Skeptic · Rebuttal" meta="free/glm-5.3-flash · replying to Advocate">
          <ol className="space-y-2">
            {data.rebuttal.map((r, i) => (
              <li key={i} className="rounded-buttons border border-hairline bg-pure-white px-3 py-2.5 text-[14px] leading-[1.5] text-graphite-ink">
                <span className="text-hollow mr-2 text-[12px]">{i + 1}.</span>
                {r}
              </li>
            ))}
          </ol>
        </MessageCard>
      )}

      {/* Judge footer */}
      <div className="rounded-cards bg-pure-white border border-hairline p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[13px] leading-[1.43] text-mid-ash">
          <span className="font-medium text-graphite-ink">You are the judge.</span> Which hit harder? Turn it into an experiment.
        </p>
        <div className="flex gap-2 shrink-0">
          <button className="rounded-full border border-hairline bg-pure-white px-3 py-1.5 text-[13px] font-medium text-graphite-ink hover:bg-hover-veil transition">
            Advocate
          </button>
          <button className="rounded-full bg-ink-press text-white px-3 py-1.5 text-[13px] font-medium hover:opacity-90 transition">Skeptic opened my eyes</button>
        </div>
      </div>
    </div>
  );
}
