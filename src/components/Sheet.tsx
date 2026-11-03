'use client';

// A bottom sheet used by every overlay (explanations, catch-up, learned list).
// It slides up over the page instead of covering it, so the match stays visible behind.
// Accessibility: focus moves in and is trapped while open, Escape closes, and focus
// returns to whatever opened it. It also closes on swipe down or a tap above it.

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  title: string; // used as the accessible name
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
const SWIPE_CLOSE_PX = 90;

export default function Sheet({ title, onClose, closeLabel, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Move focus in on open, give it back on close, and stop the page scrolling underneath.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  // Keys are handled on the document, not the panel: if the focused button disappears
  // (e.g. "Full explanation" swaps the content), focus falls to <body> and Escape must still work.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      // Keep Tab cycling inside the sheet, and pull focus back in if it escaped.
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = panel.contains(document.activeElement);
      if (!inside || (e.shiftKey && document.activeElement === first)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Swipe down on the grab bar to dismiss, like native sheets.
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientY;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > SWIPE_CLOSE_PX) onClose();
    else setDragY(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Tap above the sheet to close. Hidden from screen readers: they use Escape or the close button. */}
      <div aria-hidden="true" className="anim-fade absolute inset-0 bg-black/55" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="anim-sheet relative flex max-h-[85dvh] w-full max-w-[480px] flex-col rounded-t-[28px] border border-b-0 border-line bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : 'transform 200ms ease-out',
        }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 pt-2">
          <span className="w-12" />
          <div
            className="flex h-full flex-1 touch-none items-center justify-center"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span aria-hidden="true" className="my-2 h-1.5 w-11 rounded-full bg-line" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="grid h-12 w-12 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
