'use client';

// What the creator just said, as a chat bubble. This is the signature feature:
// the whole bubble is one big tap target that explains what the creator *meant*.

import { creatorText } from '@/lib/explain';
import type { Copy } from '@/lib/copy';
import type { CreatorLine as Line, Lang } from '@/lib/types';

interface Props {
  line: Line;
  lang: Lang;
  copy: Copy;
  onOpen: () => void;
}

export function CreatorAvatar() {
  return (
    <span
      aria-hidden="true"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-[#ff8a3d] font-display text-[14px] font-extrabold text-accent-ink"
    >
      BC
    </span>
  );
}

export default function CreatorLine({ line, lang, copy, onOpen }: Props) {
  return (
    <div className="anim-rise-late mt-4 flex items-start gap-3">
      <CreatorAvatar />
      <button
        type="button"
        onClick={onOpen}
        className="group min-w-0 flex-1 rounded-[20px] rounded-tl-md border border-line bg-surface-2 p-3.5 text-left hover:border-accent"
      >
        <span className="flex items-center gap-2 text-[12px]">
          <span className="font-bold text-text">Bhai Cric</span>
          <span className="text-muted">{copy.creatorRole}</span>
        </span>
        <span className="mt-1 block text-[16px] font-medium italic leading-snug">“{creatorText(line, lang)}”</span>
        <span className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-[13px] font-bold text-accent group-hover:bg-accent group-hover:text-accent-ink">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M6.3 6.2a1.8 1.8 0 113 1.3c-.6.4-1.3.8-1.3 1.6M8 11.2v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {copy.creatorCta}
        </span>
      </button>
    </div>
  );
}
