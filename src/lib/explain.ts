// Picks the right pre-written text for the fan's level and language.
// Nothing here generates text: it only chooses between versions we wrote and checked.

import type { BallEvent, CreatorLine, GlossaryTerm, Lang, Level } from './types';

export const LEVELS: readonly Level[] = ['beginner', 'moderate', 'advanced'];
export const LANGS: readonly Lang[] = ['en', 'hinglish'];

export function termLabel(term: GlossaryTerm, lang: Lang): string {
  return term.label[lang];
}

export function termExplanation(term: GlossaryTerm, level: Level, lang: Lang): string {
  return term.explanation[level][lang];
}

export function termReminder(term: GlossaryTerm, lang: Lang): string {
  return term.reminder[lang];
}

export function creatorText(line: CreatorLine, lang: Lang): string {
  return lang === 'en' ? line.text : line.textHinglish;
}

export function creatorMeaning(line: CreatorLine, level: Level, lang: Lang): string {
  return line.meaning[level][lang];
}

export function momentText(event: BallEvent, lang: Lang): string {
  return lang === 'en' ? event.text : event.textHinglish;
}

/** One step simpler (-1) or deeper (+1), or null when there is nowhere further to go. */
export function shiftLevel(level: Level, step: -1 | 1): Level | null {
  return LEVELS[LEVELS.indexOf(level) + step] ?? null;
}

/**
 * The big badge on a moment ("FOUR", "OUT", "WIDE"...). Derived from the ball's data,
 * so the badge can never disagree with the score.
 */
// Badges stay in English in both languages: Hindi commentary uses these same words.
export function outcomeBadge(e: BallEvent): string {
  if (e.isWicket) return 'OUT';
  if (e.isExtra === 'wide') return 'WIDE';
  if (e.isExtra === 'noball') return 'NO BALL';
  const prefix = e.isFreeHit ? 'FREE HIT · ' : '';
  if (e.runs === 6) return `${prefix}SIX`;
  if (e.runs === 4) return `${prefix}FOUR`;
  if (e.runs === 0) return `${prefix}DOT BALL`;
  return `${prefix}${e.runs} RUN${e.runs === 1 ? '' : 'S'}`;
}

export type BadgeTone = 'big' | 'out' | 'extra' | 'plain';

export function badgeTone(e: BallEvent): BadgeTone {
  if (e.isWicket) return 'out';
  if (e.isExtra) return 'extra';
  if (e.runs >= 4) return 'big';
  return 'plain';
}
