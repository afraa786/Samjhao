// Every number the UI shows comes from these pure functions.
// Nothing numeric is hand-written into text or produced by an AI: if a number
// is on screen, it was computed here from match.json.

import type { BallEvent, MatchMeta, Pressure } from './types';

/** Wides and no-balls are bowled again, so they do not use up one of the 120 balls. */
export function isLegal(e: BallEvent): boolean {
  return !e.isExtra;
}

/** Runs and wickets after event `index` (inclusive). index -1 means "before the first moment". */
export function score(events: BallEvent[], index: number): { runs: number; wickets: number } {
  let runs = 0;
  let wickets = 0;
  for (let i = 0; i <= index && i < events.length; i++) {
    const e = events[i];
    runs += (e.gapBefore?.runs ?? 0) + e.runs;
    wickets += (e.gapBefore?.wickets ?? 0) + (e.isWicket ? 1 : 0);
  }
  return { runs, wickets };
}

/** Legal balls bowled after event `index`, counting the summarised gaps too. */
export function legalBalls(events: BallEvent[], index: number): number {
  let balls = 0;
  for (let i = 0; i <= index && i < events.length; i++) {
    const e = events[i];
    balls += (e.gapBefore?.balls ?? 0) + (isLegal(e) ? 1 : 0);
  }
  return balls;
}

/** Cricket writes overs as "completed overs . balls in the current over", e.g. 87 balls -> "14.3". */
export function oversText(balls: number): string {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export function ballsLeft(totalOvers: number, balls: number): number {
  return Math.max(0, totalOvers * 6 - balls);
}

export function runsNeeded(target: number, runs: number): number {
  return Math.max(0, target - runs);
}

/** Round to 2 decimals. The tiny epsilon stops cases like 1.005 rounding down due to float error. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Runs per over so far. Zero balls bowled means no rate yet, so we show 0 rather than divide by zero. */
export function currentRunRate(runs: number, balls: number): number {
  if (balls <= 0) return 0;
  return round2((runs * 6) / balls);
}

/**
 * Runs needed per over for the rest of the chase.
 * - Nothing left to get: 0.
 * - Runs still needed but no balls left: Infinity (impossible). The UI renders this as "–".
 */
export function requiredRunRate(needed: number, left: number): number {
  if (needed <= 0) return 0;
  if (left <= 0) return Infinity;
  return round2((needed * 6) / left);
}

/** Shows a rate with 2 decimals, or a dash when it cannot be met. */
export function formatRate(rate: number): string {
  return Number.isFinite(rate) ? rate.toFixed(2) : '–';
}

/**
 * Runs and wickets in (roughly) the last 12 legal balls.
 * Gaps between moments are summarised, so we cannot split one: if a gap straddles
 * the 12-ball window we include it whole and report the true ball count we covered.
 * That keeps every number honest ("last 14 balls") instead of invented.
 */
export function lastTwelve(
  events: BallEvent[],
  index: number,
): { runs: number; wickets: number; balls: number } {
  let runs = 0;
  let wickets = 0;
  let balls = 0;
  for (let i = Math.min(index, events.length - 1); i >= 0 && balls < 12; i--) {
    const e = events[i];
    runs += e.runs;
    wickets += e.isWicket ? 1 : 0;
    balls += isLegal(e) ? 1 : 0;
    if (e.gapBefore && balls < 12) {
      runs += e.gapBefore.runs;
      wickets += e.gapBefore.wickets;
      balls += e.gapBefore.balls;
    }
  }
  return { runs, wickets, balls };
}

/**
 * How tight the chase feels, from the batting side's point of view.
 * Thresholds (kept simple on purpose so they are easy to explain in a demo):
 * - desperate: asking rate above 13 an over, or more than 3 above the scoring rate
 *   with 7+ wickets down (too many runs, too few batters left to get them).
 * - tense: asking rate above 10, or 2+ above the scoring rate, or 6+ wickets down,
 *   or it is the last two overs and runs are still needed (every ball is a big moment).
 * - building: asking rate is higher than the scoring rate at all, or 4+ wickets down.
 * - calm: the team is scoring faster than it needs to and has wickets in hand.
 */
export function pressure(
  rrr: number,
  crr: number,
  wickets: number,
  left: number = Infinity,
): Pressure {
  const gap = rrr - crr;
  if (rrr > 13 || (gap > 3 && wickets >= 7)) return 'desperate';
  if (rrr > 10 || gap >= 2 || wickets >= 6 || (left <= 12 && rrr > 0)) return 'tense';
  if (gap > 0 || wickets >= 4) return 'building';
  return 'calm';
}

export type ChaseResult = 'live' | 'won' | 'lost' | 'tied';

export function chaseResult(
  runs: number,
  wickets: number,
  target: number,
  left: number,
): ChaseResult {
  if (runs >= target) return 'won';
  // Out of balls or out of batters: the chase is over.
  if (wickets >= 10 || left <= 0) return runs === target - 1 ? 'tied' : 'lost';
  return 'live';
}

/** Everything the screen needs at one moment, computed in one place. */
export interface MatchState {
  runs: number;
  wickets: number;
  balls: number;
  overs: string;
  ballsLeft: number;
  runsNeeded: number;
  crr: number;
  rrr: number;
  pressure: Pressure;
  result: ChaseResult;
  recent: { runs: number; wickets: number; balls: number };
}

export function matchState(meta: MatchMeta, events: BallEvent[], index: number): MatchState {
  const { runs, wickets } = score(events, index);
  const balls = legalBalls(events, index);
  const left = ballsLeft(meta.totalOvers, balls);
  const needed = runsNeeded(meta.target, runs);
  const crr = currentRunRate(runs, balls);
  const rrr = requiredRunRate(needed, left);
  return {
    runs,
    wickets,
    balls,
    overs: oversText(balls),
    ballsLeft: left,
    runsNeeded: needed,
    crr,
    rrr,
    pressure: pressure(rrr, crr, wickets, left),
    result: chaseResult(runs, wickets, meta.target, left),
    recent: lastTwelve(events, index),
  };
}
