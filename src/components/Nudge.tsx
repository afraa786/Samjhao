'use client';

// A gentle "Confused?" chip for a word the fan has not learned yet. It sits right under
// the moment (never over the Next button), shows once per word per visit, and goes away
// by itself. Tapping it is the same as tapping the word.

import { useEffect } from 'react';
import { termsById } from '@/lib/data';
import type { Copy } from '@/lib/copy';
import type { Lang } from '@/lib/types';

const VISIBLE_MS = 7000;

interface Props {
  termId: string;
  lang: Lang;
  copy: Copy;
  onTap: () => void;
  onDismiss: () => void;
}

export default function Nudge({ termId, lang, copy, onTap, onDismiss }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [termId, onDismiss]);

  const label = termsById.get(termId)?.label[lang] ?? termId;

  return (
    <div role="status" className="mt-3">
      <div className="anim-chip relative overflow-hidden rounded-2xl border border-accent/60 bg-surface-2">
        <button type="button" onClick={onTap} className="flex min-h-12 w-full items-center gap-2 py-2 pl-4 pr-12 text-left">
          <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-extrabold text-accent-ink">
            ?
          </span>
          <span className="text-[14px] text-muted">
            {copy.nudge} <span className="font-bold text-text underline decoration-accent decoration-dotted decoration-2 underline-offset-4">{label}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={copy.close}
          className="absolute right-0 top-0 grid h-full w-12 place-items-center text-muted hover:text-text"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {/* Shows how long the chip will stay. */}
        <span aria-hidden="true" className="drain absolute bottom-0 left-0 h-[2px] w-full bg-accent" style={{ animationDuration: `${VISIBLE_MS}ms` }} />
      </div>
    </div>
  );
}
