'use client';

// End of the match: the result (computed) and what the fan learned along the way.
// The second part is the point: a newcomer leaving with words they now understand.

import type { MatchState } from '@/lib/matchMath';
import { termsById } from '@/lib/data';
import type { Copy } from '@/lib/copy';
import type { Lang, MatchMeta } from '@/lib/types';

interface Props {
  state: MatchState;
  meta: MatchMeta;
  learned: string[];
  lang: Lang;
  copy: Copy;
  onOpenTerm: (id: string) => void;
}

function resultLine(state: MatchState, meta: MatchMeta, copy: Copy): string {
  if (state.result === 'won') return copy.won(meta.battingTeam, 10 - state.wickets, state.ballsLeft);
  if (state.result === 'lost') return copy.lost(meta.battingTeam, meta.target - 1 - state.runs);
  return copy.tied;
}

export default function FinishCard({ state, meta, learned, lang, copy, onOpenTerm }: Props) {
  return (
    <section className="anim-rise mb-4 overflow-hidden rounded-[22px] border border-accent/50 bg-surface">
      <div className="bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,201,74,0.22),transparent_60%)] p-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent">{copy.matchOver}</p>
        <h2 className="tabular mt-1 font-display text-[26px] font-extrabold leading-tight tracking-tight">
          {resultLine(state, meta, copy)}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{copy.youLearned(learned.length)}</p>
        {learned.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {learned.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onOpenTerm(id)}
                className="min-h-10 rounded-full border border-line bg-surface-2 px-3.5 text-[13px] font-semibold hover:border-accent"
              >
                ✓ {termsById.get(id)?.label[lang] ?? id}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
