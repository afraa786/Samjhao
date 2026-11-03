// Finds glossary terms inside a moment's text so they can be underlined and tapped.
// We only look for terms the moment is tagged with: tags decide *what* is relevant,
// aliases decide *where* in the sentence it appears.

import { termsById } from './data';

export interface Segment {
  text: string;
  termId?: string; // set when this piece of text is a tappable term
}

interface Hit {
  start: number;
  end: number;
  termId: string;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Earliest place in `text` where any alias of the term appears, as a whole word. */
function findTerm(text: string, termId: string): Hit | null {
  const term = termsById.get(termId);
  if (!term) return null;
  let best: Hit | null = null;
  for (const alias of term.aliases) {
    const match = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i').exec(text);
    if (!match) continue;
    const hit = { start: match.index, end: match.index + match[0].length, termId };
    // Prefer the earliest hit; on a tie prefer the longer alias ("required run rate" over "run rate").
    if (!best || hit.start < best.start || (hit.start === best.start && hit.end > best.end)) best = hit;
  }
  return best;
}

/** Splits text into plain pieces and tappable term pieces. Each term is linked once, at its first mention. */
export function splitByTerms(text: string, tags: string[]): Segment[] {
  const hits = tags
    .map((id) => findTerm(text, id))
    .filter((h): h is Hit => h !== null)
    // Longer hits first at the same position, so overlaps resolve to the more specific term.
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start < cursor) continue; // overlaps a term we already linked
    if (hit.start > cursor) segments.push({ text: text.slice(cursor, hit.start) });
    segments.push({ text: text.slice(hit.start, hit.end), termId: hit.termId });
    cursor = hit.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

/** Tags that are relevant to the moment but not written in its text. Shown as chips instead. */
export function unlinkedTags(segments: Segment[], tags: string[]): string[] {
  const linked = new Set(segments.flatMap((s) => (s.termId ? [s.termId] : [])));
  return tags.filter((t) => !linked.has(t) && termsById.has(t));
}

/** First tag in this moment the fan has not learned and has not already been nudged about. */
export function pickNudge(tags: string[], learned: string[], alreadyNudged: Set<string>): string | null {
  return tags.find((t) => termsById.has(t) && !learned.includes(t) && !alreadyNudged.has(t)) ?? null;
}
