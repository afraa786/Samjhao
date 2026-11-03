'use client';

// First-run screen. It shows the product in one glance (a real creator line, decoded),
// then asks one question so the very first explanation is already at the right depth.

import { useState } from 'react';
import { CreatorAvatar } from './CreatorLine';
import { creatorById, termsById } from '@/lib/data';
import { creatorText, LANGS, LEVELS, termReminder } from '@/lib/explain';
import type { Copy } from '@/lib/copy';
import type { Lang, Level } from '@/lib/types';

interface Props {
  level: Level;
  lang: Lang;
  copy: Copy;
  onLang: (l: Lang) => void;
  onStart: (level: Level) => void;
}

// The example shown on the welcome screen comes straight from the real data.
const EXAMPLE_LINE = 'cl-umpires-call';
const EXAMPLE_TERM = 'umpires-call';

export default function Welcome({ level, lang, copy, onLang, onStart }: Props) {
  const [choice, setChoice] = useState<Level>(level);
  const line = creatorById.get(EXAMPLE_LINE)!;
  const term = termsById.get(EXAMPLE_TERM)!;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <p className="font-display text-[24px] font-extrabold tracking-tight">
          samjhao<span className="text-accent">.</span>
        </p>
        <div role="group" aria-label={copy.langGroup} className="flex rounded-full border border-line bg-surface p-1">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lang}
              onClick={() => onLang(l)}
              className={`min-h-10 rounded-full px-3 text-[13px] font-semibold ${l === lang ? 'bg-accent text-accent-ink' : 'text-muted'}`}
            >
              {l === 'en' ? 'English' : 'Hinglish'}
            </button>
          ))}
        </div>
      </div>

      <h1 className="anim-rise mt-8 font-display text-[34px] font-extrabold leading-[1.08] tracking-tight">
        {copy.welcomeTitle}
      </h1>
      <p className="anim-rise mt-3 text-[16px] leading-relaxed text-muted">{copy.welcomeBody}</p>

      {/* The product in one picture: what the creator said, and what it means. */}
      <figure className="anim-rise-late mt-6 rounded-[22px] border border-line bg-surface p-4" aria-hidden="true">
        <div className="flex items-start gap-3">
          <CreatorAvatar />
          <p className="min-w-0 flex-1 rounded-[18px] rounded-tl-md bg-surface-2 p-3 text-[15px] italic leading-snug">
            “{creatorText(line, lang)}”
          </p>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent font-display text-[15px] font-extrabold text-accent">
            s.
          </span>
          <p className="min-w-0 flex-1 rounded-[18px] rounded-tl-md border border-accent/40 bg-accent-soft p-3 text-[15px] leading-snug">
            {termReminder(term, lang)}
          </p>
        </div>
      </figure>

      <fieldset className="mt-7">
        <legend className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted">{copy.welcomeAsk}</legend>
        <div className="mt-3 space-y-2">
          {LEVELS.map((l) => {
            const active = l === choice;
            return (
              <label
                key={l}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${
                  active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-muted'
                }`}
              >
                <input
                  type="radio"
                  name="level"
                  value={l}
                  checked={active}
                  onChange={() => setChoice(l)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-accent' : 'border-line'}`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold">{copy.levels[l]}</span>
                  <span className="block text-[14px] text-muted">{copy.welcomeLevels[l]}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() => onStart(choice)}
          className="min-h-14 w-full rounded-2xl bg-accent text-[17px] font-extrabold text-accent-ink shadow-[0_6px_24px_rgba(255,201,74,0.25)] active:scale-[0.99]"
        >
          {copy.welcomeStart} →
        </button>
        <p className="mt-3 text-center text-[13px] text-muted">{copy.welcomeLater}</p>
      </div>
    </main>
  );
}
