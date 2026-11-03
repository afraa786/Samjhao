import { describe, expect, it } from 'vitest';
import {
  ballsLeft,
  chaseResult,
  currentRunRate,
  formatRate,
  lastTwelve,
  legalBalls,
  matchState,
  oversText,
  pressure,
  requiredRunRate,
  round2,
  runsNeeded,
  score,
} from './matchMath';
import type { BallEvent } from './types';
import { match } from './data';

// Small helper so test events stay readable.
function ball(runs: number, extra?: BallEvent['isExtra'], isWicket = false): BallEvent {
  return {
    id: 0, over: 0, ball: 1, batter: 'A', bowler: 'B',
    runs, isWicket, isExtra: extra, tags: [], text: '', textHinglish: '',
  };
}

describe('zero balls', () => {
  it('starts at 0/0 in 0.0 overs with no run rate', () => {
    expect(score([], -1)).toEqual({ runs: 0, wickets: 0 });
    expect(legalBalls([], -1)).toBe(0);
    expect(oversText(0)).toBe('0.0');
    expect(currentRunRate(0, 0)).toBe(0);
    expect(ballsLeft(20, 0)).toBe(120);
    expect(requiredRunRate(168, 120)).toBe(8.4);
    expect(lastTwelve([], -1)).toEqual({ runs: 0, wickets: 0, balls: 0 });
  });
});

describe('extras', () => {
  const events = [ball(4), ball(1, 'wide'), ball(1, 'noball'), ball(6), ball(0, undefined, true)];

  it('do not count as legal balls', () => {
    expect(legalBalls(events, 4)).toBe(3);
    expect(oversText(legalBalls(events, 4))).toBe('0.3');
  });

  it('still add their runs to the score', () => {
    expect(score(events, 4)).toEqual({ runs: 12, wickets: 1 });
  });

  it('count gaps between moments', () => {
    const withGap = [{ ...ball(4), gapBefore: { balls: 10, runs: 15, wickets: 1 } }];
    expect(score(withGap, 0)).toEqual({ runs: 19, wickets: 1 });
    expect(legalBalls(withGap, 0)).toBe(11);
  });
});

describe('overs text', () => {
  it('formats completed overs and balls', () => {
    expect(oversText(87)).toBe('14.3');
    expect(oversText(6)).toBe('1.0');
    expect(oversText(120)).toBe('20.0');
  });
});

describe('finished chase', () => {
  it('never needs negative runs and needs no rate', () => {
    expect(runsNeeded(168, 170)).toBe(0);
    expect(requiredRunRate(0, 5)).toBe(0);
    expect(chaseResult(170, 5, 168, 1)).toBe('won');
  });

  it('knows when the chase is lost or tied', () => {
    expect(chaseResult(150, 10, 168, 20)).toBe('lost');
    expect(chaseResult(160, 6, 168, 0)).toBe('lost');
    expect(chaseResult(167, 6, 168, 0)).toBe('tied');
    expect(chaseResult(160, 6, 168, 3)).toBe('live');
  });
});

describe('required run rate with no balls left', () => {
  it('is Infinity (impossible) and renders as a dash', () => {
    expect(requiredRunRate(5, 0)).toBe(Infinity);
    expect(formatRate(requiredRunRate(5, 0))).toBe('–');
  });
});

describe('rounding', () => {
  it('rounds rates to 2 decimals', () => {
    expect(requiredRunRate(56, 33)).toBe(10.18); // 10.1818...
    expect(currentRunRate(112, 87)).toBe(7.72); // 7.7241...
    expect(currentRunRate(100, 60)).toBe(10);
    expect(round2(1.005)).toBe(1.01);
    expect(formatRate(10)).toBe('10.00');
  });
});

describe('last twelve balls', () => {
  it('only looks back twelve legal balls', () => {
    const events = Array.from({ length: 15 }, () => ball(1));
    expect(lastTwelve(events, 14)).toEqual({ runs: 12, wickets: 0, balls: 12 });
  });

  it('includes extras inside the window without counting them as balls', () => {
    const events = [ball(1), ball(1, 'wide'), ball(4, undefined, true)];
    expect(lastTwelve(events, 2)).toEqual({ runs: 6, wickets: 1, balls: 2 });
  });

  it('reports the real ball count when a summarised gap straddles the window', () => {
    const events = [{ ...ball(4), gapBefore: { balls: 20, runs: 30, wickets: 2 } }];
    expect(lastTwelve(events, 0)).toEqual({ runs: 34, wickets: 2, balls: 21 });
  });
});

describe('pressure', () => {
  it('follows the documented thresholds', () => {
    expect(pressure(7, 9, 2)).toBe('calm');
    expect(pressure(8.5, 8.3, 2)).toBe('building');
    expect(pressure(7, 8, 4)).toBe('building');
    expect(pressure(10.18, 7.72, 4)).toBe('tense');
    expect(pressure(8, 8.4, 5, 6)).toBe('tense'); // last over, runs still needed
    expect(pressure(14, 8, 3)).toBe('desperate');
    expect(pressure(11.5, 7, 7)).toBe('desperate');
  });
});

// Guards on the real data file, so a typo in match.json fails the build instead of the demo.
describe('match.json', () => {
  const { meta, events } = match;

  it('has an over.ball on every moment that matches the computed ball count', () => {
    events.forEach((e, i) => {
      const balls = legalBalls(events, i);
      // A wide/no-ball is re-bowled, so its position is the *next* legal ball.
      const position = e.isExtra ? balls + 1 : balls;
      expect(`${e.id}: ${e.over * 6 + e.ball}`).toBe(`${e.id}: ${position}`);
    });
  });

  it('ends with the chase won on the last moment and not before', () => {
    const last = events.length - 1;
    expect(matchState(meta, events, last).result).toBe('won');
    expect(matchState(meta, events, last - 1).result).toBe('live');
  });
});
