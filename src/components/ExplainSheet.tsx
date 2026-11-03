'use client';

// The explanation itself, for a glossary term or for something the creator said.
// "Show simpler" / "Go deeper" change the level for this view only, so the fan can
// peek at another depth without touching their global setting.

import { useState } from 'react';
import Sheet from './Sheet';
import { CreatorAvatar } from './CreatorLine';
import { creatorById, termsById } from '@/lib/data';
import { creatorMeaning, creatorText, shiftLevel, termExplanation, termReminder } from '@/lib/explain';
import { useLiveText } from '@/lib/liveExplain';
import type { Copy } from '@/lib/copy';
import type { Lang, Level } from '@/lib/types';

export type ExplainTarget =
  | { kind: 'term'; id: string; wasLearned: boolean }
  | { kind: 'creator'; id: string };

interface Props {
  target: ExplainTarget;
  level: Level;
  lang: Lang;
  copy: Copy;
  onClose: () => void;
  onOpenTerm: (id: string) => void;
}

/** Honest label for where the words came from, so the demo never overclaims. */
export function SourceTag({ live, copy }: { live: boolean; copy: Copy }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-muted">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-calm' : 'bg-muted'}`} />
      {live ? copy.sourceLive : copy.sourceStatic}
    </span>
  );
}

function LevelSteps({ level, copy, onChange }: { level: Level; copy: Copy; onChange: (l: Level) => void }) {
  const simpler = shiftLevel(level, -1);
  const deeper = shiftLevel(level, 1);
  const btn =
    'min-h-12 flex-1 rounded-2xl border border-line bg-surface-2 px-3 text-[14px] font-semibold hover:border-accent disabled:opacity-35 disabled:hover:border-line';
  return (
    <div className="mt-5 flex gap-2">
      <button type="button" className={btn} disabled={!simpler} onClick={() => simpler && onChange(simpler)}>
        ← {copy.simpler}
      </button>
      <button type="button" className={btn} disabled={!deeper} onClick={() => deeper && onChange(deeper)}>
        {copy.deeper} →
      </button>
    </div>
  );
}

function Eyebrow({ children, live, copy }: { children: string; live: boolean; copy: Copy }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">{children}</p>
      <SourceTag live={live} copy={copy} />
    </div>
  );
}

function TermView({ id, wasLearned, level, lang, copy }: { id: string; wasLearned: boolean; level: Level; lang: Lang; copy: Copy }) {
  const term = termsById.get(id)!;
  const [shown, setShown] = useState<Level>(level);
  // A word learned earlier opens on its one-line reminder; the full text is one tap away.
  const [full, setFull] = useState(!wasLearned);
  const live = useLiveText(full ? { kind: 'term', id, level: shown, lang } : null);

  return (
    <>
      <Eyebrow live={full && !!live} copy={copy}>{`Samjhao · ${copy.levels[shown]}`}</Eyebrow>
      <h2 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-tight">{term.label[lang]}</h2>
      {full ? (
        <>
          <p key={shown + lang} className="anim-fade mt-3 text-[17px] leading-[1.65]">
            {live ?? termExplanation(term, shown, lang)}
          </p>
          <LevelSteps level={shown} copy={copy} onChange={setShown} />
        </>
      ) : (
        <>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">
            ✓ {copy.alreadyLearned}
          </p>
          <p className="mt-3 text-[19px] font-medium leading-snug">{termReminder(term, lang)}</p>
          <button
            type="button"
            onClick={() => setFull(true)}
            className="mt-5 min-h-12 w-full rounded-2xl border border-line bg-surface-2 text-[15px] font-semibold hover:border-accent"
          >
            {copy.fullExplanation}
          </button>
        </>
      )}
    </>
  );
}

function CreatorView({ id, level, lang, copy, onOpenTerm }: { id: string; level: Level; lang: Lang; copy: Copy; onOpenTerm: (id: string) => void }) {
  const line = creatorById.get(id)!;
  const [shown, setShown] = useState<Level>(level);
  const live = useLiveText({ kind: 'creator', id, level: shown, lang });

  return (
    <>
      <div className="flex items-start gap-3">
        <CreatorAvatar />
        <blockquote className="min-w-0 flex-1 rounded-[18px] rounded-tl-md bg-surface-2 p-3 text-[15px] italic leading-snug">
          “{creatorText(line, lang)}”
        </blockquote>
      </div>
      <div className="mt-5">
        <Eyebrow live={!!live} copy={copy}>{`${copy.creatorMeant} · ${copy.levels[shown]}`}</Eyebrow>
      </div>
      <p key={shown + lang} className="anim-fade mt-3 text-[17px] leading-[1.65]">
        {live ?? creatorMeaning(line, shown, lang)}
      </p>
      <LevelSteps level={shown} copy={copy} onChange={setShown} />
      {line.tags.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{copy.wordsInLine}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {line.tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onOpenTerm(t)}
                className="min-h-11 rounded-full border border-line bg-surface-2 px-4 text-[14px] font-semibold hover:border-accent"
              >
                <span className="term-label">{termsById.get(t)?.label[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ExplainSheet({ target, level, lang, copy, onClose, onOpenTerm }: Props) {
  const title =
    target.kind === 'term' ? termsById.get(target.id)?.label[lang] ?? '' : copy.creatorMeant;
  return (
    <Sheet title={title} onClose={onClose} closeLabel={copy.close}>
      {target.kind === 'term' ? (
        <TermView key={target.id} id={target.id} wasLearned={target.wasLearned} level={level} lang={lang} copy={copy} />
      ) : (
        <CreatorView key={target.id} id={target.id} level={level} lang={lang} copy={copy} onOpenTerm={onOpenTerm} />
      )}
    </Sheet>
  );
}
