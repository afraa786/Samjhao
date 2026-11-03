// Shared types for the whole app. The JSON files in src/data follow these shapes.

export type Level = 'beginner' | 'moderate' | 'advanced';
export type Lang = 'en' | 'hinglish';

/** Text that exists in both supported languages. */
export interface Bilingual {
  en: string;
  hinglish: string;
}

export interface MatchMeta {
  battingTeam: string;
  bowlingTeam: string;
  battingShort: string; // short name for the tight score card, e.g. "MAR"
  bowlingShort: string;
  target: number; // runs to win
  totalOvers: number; // 20
}

/**
 * Play that happened between the previous key moment and this one.
 * We only tell the story in key moments, not every ball, so this keeps the
 * score honest: total runs = sum of every gap + every moment's own runs.
 */
export interface GapBefore {
  balls: number; // legal balls bowled in the gap
  runs: number;
  wickets: number;
}

export interface BallEvent {
  id: number;
  over: number; // 0-based over index
  ball: number; // 1..6 within the over (for a wide/no-ball: the ball being re-bowled)
  batter: string;
  bowler: string;
  runs: number; // runs scored off this ball (incl. extras)
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout';
  isExtra?: 'wide' | 'noball';
  isFreeHit?: boolean;
  gapBefore?: GapBefore;
  tags: string[]; // glossary term ids relevant to this moment
  text: string; // plain commentary for the moment (English)
  textHinglish: string; // same, in Hinglish
  creatorLineId?: string; // links to creator.json
}

export interface MatchData {
  meta: MatchMeta;
  events: BallEvent[];
}

export interface CreatorLine {
  id: string;
  text: string;
  textHinglish: string;
  tags: string[]; // glossary term ids it uses or alludes to
  meaning: Record<Level, Bilingual>;
}

export interface GlossaryTerm {
  id: string; // e.g. 'powerplay'
  label: Bilingual;
  /** Words that, when found in moment text, become tappable for this term. */
  aliases: string[];
  explanation: Record<Level, Bilingual>;
  reminder: Bilingual; // one line shown once learned
}

export type Pressure = 'calm' | 'building' | 'tense' | 'desperate';
