'use client';

// The 20-second briefing: where it stands, what just happened, what to watch next.
// Built entirely from computed numbers in catchUp.ts.

import Sheet from './Sheet';
import { SourceTag } from './ExplainSheet';
import { buildCatchUp } from '@/lib/catchUp';
import { useLiveText } from '@/lib/liveExplain';
import type { MatchState } from '@/lib/matchMath';
import type { Copy } from '@/lib/copy';
import type { Lang, Level, MatchMeta } from '@/lib/types';

interface Props {
  state: MatchState;
  meta: MatchMeta;
  level: Level;
  lang: Lang;
  copy: Copy;
  momentNumber: number;
  onClose: () => void;
}

/** Only numbers (and the pressure word) are sent to the optional live AI. */
function apiState(m: MatchState, meta: MatchMeta) {
  return {
    runs: m.runs,
    wickets: m.wickets,
    balls: m.balls,
    ballsLeft: m.ballsLeft,
    runsNeeded: m.runsNeeded,
    target: meta.target,
    rrr: Number.isFinite(m.rrr) ? m.rrr : null,
    crr: m.crr,
    recentRuns: m.recent.runs,
    recentWickets: m.recent.wickets,
    recentBalls: m.recent.balls,
    pressure: m.pressure,
  };
}

export default function CatchUpSheet({ state, meta, level, lang, copy, momentNumber, onClose }: Props) {
  const brief = buildCatchUp(state, meta, level, lang);
  // The id ties the live answer to this exact moment, so it is never reused for another one.
  const live = useLiveText({ kind: 'catchup', id: `m${momentNumber}`, level, lang, state: apiState(state, meta) });

  const sections = [
    { title: copy.catchUpStanding, body: brief.standing },
    { title: copy.catchUpRecent, body: brief.recent },
    { title: copy.catchUpNext, body: brief.next },
  ];

  return (
    <Sheet title={copy.catchUpTitle} onClose={onClose} closeLabel={copy.close}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">
          {copy.catchUpTitle} · {copy.levels[level]}
        </p>
        <SourceTag live={!!live} copy={copy} />
      </div>
      {live ? (
        <p className="anim-fade mt-4 text-[17px] leading-[1.65]">{live}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {sections.map((s) => (
            <section key={s.title} className="border-l-2 border-accent/70 pl-3.5">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">{s.title}</h3>
              <p className="tabular mt-1 text-[16px] leading-[1.6]">{s.body}</p>
            </section>
          ))}
        </div>
      )}
    </Sheet>
  );
}
