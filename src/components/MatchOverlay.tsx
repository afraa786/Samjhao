'use client';

import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';
import gsap from 'gsap';
import { buildCatchUp } from '@/lib/catchUp';
import { momentText, outcomeBadge } from '@/lib/explain';
import type { Copy } from '@/lib/copy';
import type { MatchState } from '@/lib/matchMath';
import type { BallEvent, Lang, Level, MatchMeta } from '@/lib/types';

interface Props {
  contentRef: RefObject<HTMLDivElement | null>;
  controlsRef: RefObject<HTMLDivElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
  open: boolean;
  state: MatchState;
  meta: MatchMeta;
  event: BallEvent;
  level: Level;
  lang: Lang;
  copy: Copy;
  momentNumber: number;
  totalMoments: number;
  onOpenChange: (open: boolean) => void;
}

export default function MatchOverlay({
  contentRef,
  controlsRef,
  toggleRef,
  open,
  state,
  meta,
  event,
  level,
  lang,
  copy,
  momentNumber,
  totalMoments,
  onOpenChange,
}: Props) {
  const sidebarRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);
  const catchUp = buildCatchUp(state, meta, level, lang);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const toggle = toggleRef.current;
    if (!sidebar || !toggle) return;

    const cards = gsap.utils.toArray<HTMLElement>('.match-menu-card', sidebar);
    const blurredElements = [contentRef.current, controlsRef.current].filter(
      (element): element is HTMLDivElement => element !== null,
    );
    sidebar.style.pointerEvents = 'none';

    return () => {
      gsap.killTweensOf([toggle, ...cards, ...blurredElements]);
      gsap.set(cards, { clearProps: 'right' });
      gsap.set(toggle, { clearProps: 'right' });
      gsap.set(blurredElements, { clearProps: 'filter' });
    };
  }, [contentRef, controlsRef, toggleRef]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const toggle = toggleRef.current;
    if (!sidebar || !toggle) return;

    const cards = gsap.utils.toArray<HTMLElement>('.match-menu-card', sidebar);
    const blurredElements = [contentRef.current, controlsRef.current].filter(
      (element): element is HTMLDivElement => element !== null,
    );

    if (open) {
      sidebar.style.pointerEvents = 'all';
      sidebar.querySelector<HTMLButtonElement>('.match-menu-card')?.focus();
      gsap.to(toggle, { right: '-500px', duration: 1, ease: 'power4.out' });
      gsap.to(cards, { right: '0%', stagger: 0.075, duration: 1, ease: 'power4.out' });
      gsap.to(blurredElements, { filter: 'blur(15px)', duration: 1, immediateRender: false });
    } else if (wasOpenRef.current) {
      sidebar.style.pointerEvents = 'none';
      toggle.focus();
      gsap.to(toggle, { right: '0px', duration: 1, ease: 'power4.out' });
      gsap.to(cards, { right: '-110%', stagger: 0.075, duration: 1, ease: 'power4.out' });
      gsap.to(blurredElements, { filter: 'blur(0px)', duration: 1, immediateRender: false });
    }
    wasOpenRef.current = open;
  }, [contentRef, controlsRef, open, toggleRef]);

  const closeMenu = () => {
    onOpenChange(false);
    toggleRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      id="match-overlay-sidebar"
      aria-label={copy.matchMenu}
      aria-hidden={!open}
      inert={!open}
      className="match-overlay-sidebar"
      onKeyDown={onMenuKeyDown}
    >
      <button
        type="button"
        onClick={closeMenu}
        className="match-menu-card"
        aria-label={`${meta.battingTeam}: ${state.runs}/${state.wickets}`}
      >
        <div className="match-menu-card-title">
          <span>{meta.battingTeam}</span>
          <span className="match-menu-close" aria-hidden="true">×</span>
        </div>
        <div className="match-menu-card-copy">
          <strong className="tabular text-3xl">{state.runs}/{state.wickets}</strong>
          <p className="mt-1">{state.overs} {copy.overs} · {copy.need(state.runsNeeded, state.ballsLeft)}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={closeMenu}
        className="match-menu-card"
        aria-label={`${copy.momentOf(momentNumber, totalMoments)}: ${outcomeBadge(event)}`}
      >
        <div className="match-menu-card-title">{copy.momentOf(momentNumber, totalMoments)}</div>
        <div className="match-menu-card-copy">
          <strong>{outcomeBadge(event)}</strong>
          <p className="mt-1 line-clamp-3">{momentText(event, lang)}</p>
        </div>
      </button>

      <button type="button" onClick={closeMenu} className="match-menu-card" aria-label={copy.catchUpTitle}>
        <div className="match-menu-card-title">{copy.catchUpTitle}</div>
        <div className="match-menu-card-copy">
          <p className="line-clamp-3">{catchUp.standing}</p>
        </div>
      </button>
    </aside>
  );
}
