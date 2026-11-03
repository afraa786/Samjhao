// Tests for the term finder and the catch-up builder.
import { describe, expect, it } from 'vitest';
import { buildCatchUp } from './catchUp';
import { match } from './data';
import { LANGS, LEVELS, shiftLevel } from './explain';
import { currentRunRate, formatRate, matchState } from './matchMath';
import { pickNudge, splitByTerms, unlinkedTags } from './terms';

describe('splitByTerms', () => {
  it('links tagged terms where they appear and keeps the full text', () => {
    const text = 'FOUR! The powerplay is nearly done.';
    const segs = splitByTerms(text, ['powerplay', 'boundary']);
    expect(segs.map((s) => s.text).join('')).toBe(text);
    expect(segs.filter((s) => s.termId).map((s) => [s.text, s.termId])).toEqual([
      ['FOUR', 'boundary'],
      ['powerplay', 'powerplay'],
    ]);
  });

  it('prefers the longer term when two overlap', () => {
    const segs = splitByTerms('the required run rate climbs', ['run-rate', 'required-run-rate']);
    expect(segs.filter((s) => s.termId).map((s) => s.termId)).toEqual(['required-run-rate']);
    expect(unlinkedTags(segs, ['run-rate', 'required-run-rate'])).toEqual(['run-rate']);
  });

  it('only matches whole words', () => {
    expect(splitByTerms('a sixer', ['boundary']).every((s) => !s.termId)).toBe(true);
  });

  it('every tag in the match is reachable: inline or as a chip', () => {
    for (const e of match.events) {
      for (const text of [e.text, e.textHinglish]) {
        const segs = splitByTerms(text, e.tags);
        const linked = segs.filter((s) => s.termId).map((s) => s.termId);
        expect([...linked, ...unlinkedTags(segs, e.tags)].sort()).toEqual([...e.tags].sort());
      }
    }
  });
});

describe('pickNudge', () => {
  it('skips learned and already-nudged words', () => {
    expect(pickNudge(['powerplay', 'boundary'], [], new Set())).toBe('powerplay');
    expect(pickNudge(['powerplay', 'boundary'], ['powerplay'], new Set())).toBe('boundary');
    expect(pickNudge(['powerplay', 'boundary'], ['powerplay'], new Set(['boundary']))).toBeNull();
  });
});

describe('shiftLevel', () => {
  it('stops at both ends', () => {
    expect(shiftLevel('beginner', -1)).toBeNull();
    expect(shiftLevel('beginner', 1)).toBe('moderate');
    expect(shiftLevel('advanced', 1)).toBeNull();
  });
});

describe('catch-up briefing', () => {
  const { meta, events } = match;

  it('only contains numbers that were computed for that moment', () => {
    events.forEach((_, i) => {
      const m = matchState(meta, events, i);
      const allowed = new Set(
        [
          m.runs, m.wickets, m.ballsLeft, m.runsNeeded, meta.target, m.overs,
          formatRate(m.rrr), formatRate(m.crr), m.recent.runs, m.recent.wickets, m.recent.balls,
          formatRate(currentRunRate(m.recent.runs, m.recent.balls)),
        ].map(String),
      );
      for (const level of LEVELS) {
        for (const lang of LANGS) {
          const b = buildCatchUp(m, meta, level, lang);
          const numbers = `${b.standing} ${b.recent} ${b.next}`.match(/\d+(\.\d+)?/g) ?? [];
          for (const n of numbers) expect(allowed.has(n), `moment ${i + 1} ${level}/${lang}: ${n}`).toBe(true);
        }
      }
    });
  });

  it('reads in about 20 seconds (under ~70 words) at every level', () => {
    events.forEach((_, i) => {
      const m = matchState(meta, events, i);
      for (const level of LEVELS) {
        const b = buildCatchUp(m, meta, level, 'en');
        const words = `${b.standing} ${b.recent} ${b.next}`.split(/\s+/).length;
        expect(words).toBeLessThanOrEqual(75);
      }
    });
  });
});
