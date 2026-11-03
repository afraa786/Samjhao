'use client';

// The thumb-zone bar: "Catch me up" on the left, the big "Next moment" on the right.
// At the end of the match the primary button becomes "Watch again".

import type { Copy } from '@/lib/copy';

interface Props {
  isEnd: boolean;
  copy: Copy;
  onNext: () => void;
  onCatchUp: () => void;
  onRestart: () => void;
}

export default function Controls({ isEnd, copy, onNext, onCatchUp, onRestart }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[480px] gap-2.5 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onCatchUp}
          className="flex min-h-14 min-w-0 items-center gap-2 rounded-2xl border border-line bg-surface px-3 text-left text-[14px] font-semibold leading-tight hover:border-accent min-[360px]:px-4 min-[360px]:text-[15px]"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" className="hidden shrink-0 text-accent min-[360px]:block">
            <path d="M3 9a6 6 0 106-6 6 6 0 00-4.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M3 2.5V5.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 6v3.2l2 1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {copy.catchUp}
        </button>
        <button
          type="button"
          onClick={isEnd ? onRestart : onNext}
          className="flex min-h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-[16px] font-extrabold text-accent-ink shadow-[0_6px_24px_rgba(255,201,74,0.25)] transition-transform active:scale-[0.98]"
        >
          {isEnd ? copy.watchAgain : copy.next}
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
            {isEnd ? (
              <path d="M14 9a5 5 0 11-1.5-3.6M14 3v3h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 9h10m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
