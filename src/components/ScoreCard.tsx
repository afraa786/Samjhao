'use client';

// The always-visible scoreboard. Every number here comes from matchMath.ts via `state`.
// The rate pills are tappable too: "Required rate" is jargon just like "powerplay".

import { formatRate, type MatchState } from '@/lib/matchMath';
import type { Copy } from '@/lib/copy';
import type { MatchMeta, Pressure } from '@/lib/types';

interface Props {
  meta: MatchMeta;
  state: MatchState;
  copy: Copy;
  onOpenTerm: (id: string) => void;
}

const PRESSURE_STEPS: Pressure[] = ['calm', 'building', 'tense', 'desperate'];
const PRESSURE_BG: Record<Pressure, string> = {
  calm: 'bg-calm',
  building: 'bg-building',
  tense: 'bg-tense',
  desperate: 'bg-desperate',
};
const PRESSURE_TEXT: Record<Pressure, string> = {
  calm: 'text-calm',
  building: 'text-building',
  tense: 'text-tense',
  desperate: 'text-desperate',
};

/** Four rising bars: how many are filled and the word carry the meaning; colour only reinforces it. */
function PressureMeter({ level, label, heading }: { level: Pressure; label: string; heading: string }) {
  const filled = PRESSURE_STEPS.indexOf(level) + 1;
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${heading}: ${label}`}>
      <div className="flex items-end gap-[3px]" aria-hidden="true">
        {PRESSURE_STEPS.map((step, i) => (
          <span
            key={step}
            className={`w-[5px] rounded-sm transition-colors duration-300 ${i < filled ? PRESSURE_BG[level] : 'bg-line'}`}
            style={{ height: `${7 + i * 3}px` }}
          />
        ))}
      </div>
      <span aria-hidden="true" className={`text-[12px] font-bold uppercase tracking-[0.08em] ${PRESSURE_TEXT[level]}`}>
        {label}
      </span>
    </div>
  );
}

/** A small tappable stat: label is underlined like any other glossary word. */
function RatePill({ label, value, onTap, hint }: { label: string; value: string; onTap: () => void; hint: string }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`${label} ${value}. ${hint}`}
      className="flex min-h-12 items-baseline gap-1.5 rounded-xl px-2 hover:bg-surface-2"
    >
      <span className="term-label text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{label}</span>
      <span className="tabular text-[15px] font-bold">{value}</span>
    </button>
  );
}

export default function ScoreCard({ meta, state, copy, onOpenTerm }: Props) {
  const live = state.result === 'live';
  return (
    <section aria-label="Score" className="mx-4 mt-3 rounded-[22px] border border-line bg-surface px-4 pb-1 pt-3">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        <span className="truncate">{meta.battingTeam}</span>
        <span className="tabular shrink-0">
          {copy.chasing} <span className="text-text">{meta.target}</span>
        </span>
      </div>

      <div className="mt-0.5 flex items-end justify-between gap-3">
        <p className="tabular font-display text-[38px] font-extrabold leading-none tracking-tight">
          {state.runs}
          <span className="text-muted">/</span>
          {state.wickets}
          <span className="ml-2 text-[14px] font-semibold tracking-normal text-muted">
            {state.overs} {copy.overs}
          </span>
        </p>
        {live && (
          <div className="pb-1">
            <PressureMeter level={state.pressure} label={copy.pressure[state.pressure]} heading={copy.pressureLabel} />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-1">
        <p className="tabular min-w-0 text-[14px] font-semibold text-accent">
          {live ? copy.need(state.runsNeeded, state.ballsLeft) : copy.matchOver}
        </p>
        <div className="-mr-2 flex shrink-0">
          {live && (
            <RatePill
              label="RRR"
              value={formatRate(state.rrr)}
              onTap={() => onOpenTerm('required-run-rate')}
              hint={copy.tapToLearn(copy.reqRate)}
            />
          )}
          <RatePill
            label="RR"
            value={formatRate(state.crr)}
            onTap={() => onOpenTerm('run-rate')}
            hint={copy.tapToLearn(copy.runRate)}
          />
        </div>
      </div>
    </section>
  );
}
