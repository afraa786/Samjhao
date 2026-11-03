'use client';

// Top bar: the name, the learned-today tally, and the two controls that change
// how everything is explained (level and language). Always visible.

import type { ReactNode } from 'react';
import { LANGS, LEVELS } from '@/lib/explain';
import type { Copy } from '@/lib/copy';
import type { Lang, Level } from '@/lib/types';

interface Props {
  level: Level;
  lang: Lang;
  copy: Copy;
  onLevel: (l: Level) => void;
  onLang: (l: Lang) => void;
  learnedSlot: ReactNode;
}

const LANG_LABEL: Record<Lang, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  hinglish: { short: 'HI', full: 'Hinglish' },
};

/** A row of toggle buttons where exactly one is pressed. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
  ariaFor,
  className = '',
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
  ariaFor?: (v: T) => string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`flex rounded-full border border-line bg-surface p-1 ${className}`}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            aria-label={ariaFor?.(opt)}
            onClick={() => onChange(opt)}
            className={`min-h-10 flex-1 rounded-full px-3 text-[13px] font-semibold tracking-wide transition-colors ${
              active ? 'bg-accent text-accent-ink' : 'text-muted hover:text-text'
            }`}
          >
            {render(opt)}
          </button>
        );
      })}
    </div>
  );
}

export default function Header({ level, lang, copy, onLevel, onLang, learnedSlot }: Props) {
  return (
    <header className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <p className="mr-auto shrink-0 font-display text-[24px] min-[360px]:text-[26px] font-extrabold leading-none tracking-tight">
          samjhao<span className="text-accent">.</span>
        </p>
        {learnedSlot}
        <Segmented
          label={copy.langGroup}
          options={LANGS}
          value={lang}
          onChange={onLang}
          render={(l) => LANG_LABEL[l].short}
          ariaFor={(l) => LANG_LABEL[l].full}
          className="shrink-0"
        />
      </div>
      <Segmented
        label={copy.levelGroup}
        options={LEVELS}
        value={level}
        onChange={onLevel}
        render={(l) => copy.levels[l]}
        className="mt-3"
      />
    </header>
  );
}
