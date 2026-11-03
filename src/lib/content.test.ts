// Checks on the written content, so the rules in the brief are enforced by tests,
// not by hoping nobody makes a typo.
import { describe, expect, it } from 'vitest';
import { creatorById, creatorLines, glossary, match, termsById } from './data';
import type { Level } from './types';

const words = (s: string) => s.trim().split(/\s+/).length;
const LIMITS: Record<Level, [number, number]> = {
  beginner: [40, 70],
  moderate: [20, 35],
  advanced: [10, 25],
};

describe('glossary', () => {
  it('has the 18 required terms', () => {
    expect(glossary).toHaveLength(18);
  });

  it.each(glossary.map((t) => [t.id, t] as const))(
    '%s English explanations stay inside the word limits for each level',
    (_id, term) => {
      for (const level of Object.keys(LIMITS) as Level[]) {
        const [min, max] = LIMITS[level];
        const n = words(term.explanation[level].en);
        expect(n, `${term.id} ${level} has ${n} words`).toBeGreaterThanOrEqual(min);
        expect(n, `${term.id} ${level} has ${n} words`).toBeLessThanOrEqual(max);
      }
    },
  );
});

describe('tags and links', () => {
  it('every moment tag points at a real glossary term', () => {
    for (const e of match.events) for (const tag of e.tags) expect(termsById.has(tag), tag).toBe(true);
  });

  it('every creator tag points at a real glossary term', () => {
    for (const c of creatorLines) for (const tag of c.tags) expect(termsById.has(tag), tag).toBe(true);
  });

  it('every creatorLineId exists, and each of the 14 lines is used once', () => {
    const used = match.events.flatMap((e) => (e.creatorLineId ? [e.creatorLineId] : []));
    for (const id of used) expect(creatorById.has(id), id).toBe(true);
    expect(creatorLines).toHaveLength(14);
    expect(new Set(used).size).toBe(14);
  });
});

describe('no hand-written numbers', () => {
  // Scores, rates and counts must be computed. Moment and creator text therefore has no digits.
  it('moment text has no digits', () => {
    for (const e of match.events) {
      expect(e.text, `event ${e.id}`).not.toMatch(/\d/);
      expect(e.textHinglish, `event ${e.id}`).not.toMatch(/\d/);
    }
  });

  it('creator lines and their meanings have no digits', () => {
    for (const c of creatorLines) {
      const all = [c.text, c.textHinglish, ...Object.values(c.meaning).flatMap((m) => [m.en, m.hinglish])];
      for (const s of all) expect(s, c.id).not.toMatch(/\d/);
    }
  });
});
