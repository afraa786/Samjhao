'use client';

// Samjhao's single screen. This file only holds state and wiring;
// numbers come from lib/matchMath.ts and words come from lib/explain.ts + data/.

import { useCallback, useRef, useState } from 'react';
import Header from '@/components/Header';
import ScoreCard from '@/components/ScoreCard';
import MomentCard from '@/components/MomentCard';
import CreatorLine from '@/components/CreatorLine';
import ExplainSheet, { type ExplainTarget } from '@/components/ExplainSheet';
import CatchUpSheet from '@/components/CatchUpSheet';
import Nudge from '@/components/Nudge';
import LearnedTally from '@/components/LearnedTally';
import Controls from '@/components/Controls';
import FinishCard from '@/components/FinishCard';
import Welcome from '@/components/Welcome';
import MatchOverlay from '@/components/MatchOverlay';
import { creatorById, match } from '@/lib/data';
import { COPY } from '@/lib/copy';
import { LANGS, LEVELS } from '@/lib/explain';
import { matchState } from '@/lib/matchMath';
import { isBoolean, isOneOf, isStringArray, usePersisted } from '@/lib/storage';
import { pickNudge } from '@/lib/terms';
import type { Lang, Level } from '@/lib/types';

const { meta, events } = match;
const LAST = events.length - 1;
const NO_TERMS: string[] = []; // stable fallback, so the storage hook sees the same value every time
const isLevel = isOneOf(LEVELS);
const isLang = isOneOf(LANGS);

type OpenSheet = { type: 'explain'; target: ExplainTarget } | { type: 'catchup' } | null;

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

export default function Home() {
  // Saved between visits (guarded localStorage).
  const [level, setLevel] = usePersisted<Level>('level', 'beginner', isLevel);
  const [lang, setLang] = usePersisted<Lang>('lang', 'en', isLang);
  const [learned, setLearned] = usePersisted<string[]>('learned', NO_TERMS, isStringArray);
  const [onboarded, setOnboarded] = usePersisted<boolean>('onboarded', false, isBoolean);

  // This visit only.
  const [index, setIndex] = useState(0);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const nudged = useRef(new Set<string>()); // each word is nudged at most once per visit

  const copy = COPY[lang];
  const event = events[index];
  const state = matchState(meta, events, index);
  const creator = event.creatorLineId ? creatorById.get(event.creatorLineId) : undefined;
  const isEnd = index === LAST;

  /** Offer a nudge for the first unfamiliar word in a moment, if there is one. */
  const offerNudge = (i: number) => {
    const term = pickNudge(events[i].tags, learned, nudged.current);
    if (term) nudged.current.add(term);
    setNudge(term);
  };

  const openTerm = (id: string) => {
    setSheet({ type: 'explain', target: { kind: 'term', id, wasLearned: learned.includes(id) } });
    if (!learned.includes(id)) setLearned([...learned, id]); // tapping a word counts as learning it
    if (nudge === id) setNudge(null);
  };

  const next = () => {
    if (isEnd) return;
    setIndex(index + 1);
    offerNudge(index + 1);
    scrollToTop();
  };

  const restart = () => {
    setIndex(0);
    setNudge(null);
    setSheet(null);
    scrollToTop();
  };

  const start = (chosen: Level) => {
    setLevel(chosen);
    setOnboarded(true);
    offerNudge(0);
    window.scrollTo(0, 0); // the welcome screen may have been scrolled down to the Start button
  };

  const closeSheet = useCallback(() => setSheet(null), []);
  const dismissNudge = useCallback(() => setNudge(null), []);

  if (!onboarded) {
    return <Welcome level={level} lang={lang} copy={copy} onLang={setLang} onStart={start} />;
  }

  return (
    <>
      <div ref={contentRef}>
      {/* Score stays pinned on normal phones. On very short screens (in-app browsers with
          big toolbars) it scrolls away so the moment itself has room; Next stays pinned. */}
      <div className="sticky top-0 z-20 border-b border-line/60 bg-bg/85 pb-3 backdrop-blur-md [@media(max-height:700px)]:static">
        <div className="mx-auto max-w-[480px]">
          <Header
            level={level}
            lang={lang}
            copy={copy}
            onLevel={setLevel}
            onLang={setLang}
            learnedSlot={
              <LearnedTally learned={learned} lang={lang} copy={copy} onOpenTerm={openTerm} onReset={() => setLearned([])} />
            }
          />
          <ScoreCard meta={meta} state={state} copy={copy} onOpenTerm={openTerm} />
        </div>
      </div>

      <main className="mx-auto max-w-[480px] px-4 pb-[calc(120px+env(safe-area-inset-bottom))] pt-4">
        <h1 className="sr-only">Samjhao: {copy.tagline}</h1>

        {/* Live strip: where we are in the simulated feed. */}
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold">
          {isEnd ? (
            <span className="whitespace-nowrap rounded-full bg-surface-2 px-2 py-0.5 text-muted">{copy.matchOver}</span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-out/15 px-2 py-0.5 text-out">
              <span aria-hidden="true" className="anim-live h-1.5 w-1.5 rounded-full bg-out" />
              {copy.live}
            </span>
          )}
          <span className="tabular whitespace-nowrap text-muted">{copy.momentOf(index + 1, events.length)}</span>
          <button
            type="button"
            onClick={restart}
            className="-mr-2 ml-auto min-h-12 shrink-0 rounded-full px-3 text-muted hover:text-text"
          >
            ↺ {copy.restart}
          </button>
        </div>
        <div
          className="-mt-1 mb-4 h-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label={copy.momentOf(index + 1, events.length)}
          aria-valuemin={1}
          aria-valuemax={events.length}
          aria-valuenow={index + 1}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${((index + 1) / events.length) * 100}%` }}
          />
        </div>

        {/* At full time the result leads; the final moment follows it. */}
        {isEnd && (
          <FinishCard state={state} meta={meta} learned={learned} lang={lang} copy={copy} onOpenTerm={openTerm} />
        )}
        <MomentCard key={`m${index}`} event={event} lang={lang} copy={copy} onOpenTerm={openTerm} />
        {nudge && !learned.includes(nudge) && (
          <Nudge key={nudge} termId={nudge} lang={lang} copy={copy} onTap={() => openTerm(nudge)} onDismiss={dismissNudge} />
        )}
        {creator && (
          <CreatorLine
            key={`c${index}`}
            line={creator}
            lang={lang}
            copy={copy}
            onOpen={() => setSheet({ type: 'explain', target: { kind: 'creator', id: creator.id } })}
          />
        )}
      </main>
      </div>

      <Controls
        isEnd={isEnd}
        copy={copy}
        filterRef={controlsRef}
        menuToggleRef={menuToggleRef}
        menuOpen={menuOpen}
        onNext={next}
        onCatchUp={() => setSheet({ type: 'catchup' })}
        onRestart={restart}
        onToggleMenu={() => setMenuOpen((isOpen) => !isOpen)}
      />

      {sheet?.type === 'explain' && (
        <ExplainSheet target={sheet.target} level={level} lang={lang} copy={copy} onClose={closeSheet} onOpenTerm={openTerm} />
      )}
      {sheet?.type === 'catchup' && (
        <CatchUpSheet
          state={state}
          meta={meta}
          level={level}
          lang={lang}
          copy={copy}
          momentNumber={index + 1}
          onClose={closeSheet}
        />
      )}
      <MatchOverlay
        contentRef={contentRef}
        controlsRef={controlsRef}
        toggleRef={menuToggleRef}
        open={menuOpen}
        state={state}
        meta={meta}
        event={event}
        level={level}
        lang={lang}
        copy={copy}
        momentNumber={index + 1}
        totalMoments={events.length}
        onOpenChange={setMenuOpen}
      />
    </>
  );
}
