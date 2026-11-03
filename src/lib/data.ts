// One place that imports the JSON files and gives them proper types.
// Lookups are built once so components can find a term or creator line by id cheaply.

import matchJson from '@/data/match.json';
import creatorJson from '@/data/creator.json';
import glossaryJson from '@/data/glossary.json';
import type { CreatorLine, GlossaryTerm, MatchData } from './types';

export const match = matchJson as MatchData;
export const creatorLines = creatorJson as CreatorLine[];
export const glossary = glossaryJson as GlossaryTerm[];

export const termsById = new Map(glossary.map((t) => [t.id, t]));
export const creatorById = new Map(creatorLines.map((c) => [c.id, c]));
