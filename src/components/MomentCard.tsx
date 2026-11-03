'use client';

// The current moment of the match. Glossary words in the text are underlined and
// tappable; tagged terms that are not written in the sentence appear as chips below,
// so nothing relevant is ever hidden.

import { badgeTone, momentText, outcomeBadge, type BadgeTone } from '@/lib/explain';
import { splitByTerms, unlinkedTags } from '@/lib/terms';
import { termsById } from '@/lib/data';
import type { Copy } from '@/lib/copy';
import type { BallEvent, Lang } from '@/lib/types';

interface Props {
  event: BallEvent;
  lang: Lang;
  copy: Copy;
  onOpenTerm: (id: string) => void;
}

const BADGE_STYLE: Record<BadgeTone, string> = {
  big: 'bg-accent text-accent-ink',
  out: 'bg-out text-[#2a0606]',
  extra: 'border border-accent text-accent',
  plain: 'bg-surface-2 text-text',
};

const surname = (name: string) => name.split(' ').at(-1);

export default function MomentCard({ event, lang, copy, onOpenTerm }: Props) {
  const text = momentText(event, lang);
  const segments = splitByTerms(text, event.tags);
  const extraTerms = unlinkedTags(segments, event.tags);
  // Commentary style "14.3" = 3rd ball of the 15th over. A test checks these against the computed ball count.
  const shownOver = `${event.over}.${event.ball}`;
  const gap = event.gapBefore;

  return (
    <article className="anim-rise rounded-[22px] border border-line bg-surface p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className={`anim-pop rounded-full px-3 py-1 text-[13px] font-extrabold tracking-[0.08em] ${BADGE_STYLE[badgeTone(event)]}`}>
          {outcomeBadge(event)}
        </span>
        <span className="tabular text-right text-[12px] font-medium text-muted">
          {copy.overBall(shownOver)} · {surname(event.bowler)} to {surname(event.batter)}
        </span>
      </div>

      <p className="mt-3 text-[18px] leading-[1.55]">
        {segments.map((seg, i) =>
          seg.termId ? (
            <button
              key={i}
              type="button"
              className="term inline text-left"
              onClick={() => onOpenTerm(seg.termId!)}
              aria-label={`${seg.text}: ${copy.tapToLearn(termsById.get(seg.termId)!.label[lang])}`}
            >
              {seg.text}
            </button>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>

      {extraTerms.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{copy.alsoHere}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {extraTerms.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onOpenTerm(id)}
                className="min-h-10 rounded-full border border-line bg-surface-2 px-3.5 text-[14px] font-semibold hover:border-accent"
              >
                <span className="term-label">{termsById.get(id)!.label[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {gap && (
        <p className="tabular mt-3 border-t border-line pt-3 text-[12px] text-muted">
          {copy.sinceLast(gap.runs, gap.balls, gap.wickets)}
        </p>
      )}
    </article>
  );
}
