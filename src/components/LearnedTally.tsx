'use client';

// "Learned: 4" in the header, opening a list of everything the fan has tapped today.
// Tapping a learned word opens its short reminder first (handled by ExplainSheet).

import { useState } from 'react';
import Sheet from './Sheet';
import { termsById } from '@/lib/data';
import type { Copy } from '@/lib/copy';
import type { Lang } from '@/lib/types';

interface Props {
  learned: string[];
  lang: Lang;
  copy: Copy;
  onOpenTerm: (id: string) => void;
  onReset: () => void;
}

export default function LearnedTally({ learned, lang, copy, onOpenTerm, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const count = learned.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${copy.learnedTitle}: ${count}`}
        className="flex min-h-12 min-w-12 shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[13px] font-semibold hover:border-accent"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
          <path d="M3 2.5h7.5a2 2 0 012 2v9H5a2 2 0 01-2-2v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M3 11.5a2 2 0 012-2h7.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="hidden text-muted min-[360px]:inline">{copy.learned}</span>
        {/* key replays the pop whenever the count goes up */}
        <span key={count} className="anim-pop tabular text-text">{count}</span>
      </button>

      {open && (
        <Sheet title={copy.learnedTitle} onClose={() => setOpen(false)} closeLabel={copy.close}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[26px] font-extrabold tracking-tight">{copy.learnedTitle}</h2>
            <span className="tabular text-[15px] font-semibold text-accent">{count}</span>
          </div>
          {count === 0 ? (
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{copy.learnedEmpty}</p>
          ) : (
            <>
              <p className="mt-1 text-[13px] text-muted">{copy.learnedHint}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {learned.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpenTerm(id);
                      }}
                      className="min-h-11 rounded-full border border-line bg-surface-2 px-4 text-[14px] font-semibold hover:border-accent"
                    >
                      ✓ {termsById.get(id)?.label[lang] ?? id}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onReset}
                className="mt-6 min-h-12 w-full rounded-2xl border border-line text-[14px] font-semibold text-muted hover:border-out hover:text-out"
              >
                {copy.reset}
              </button>
            </>
          )}
        </Sheet>
      )}
    </>
  );
}
