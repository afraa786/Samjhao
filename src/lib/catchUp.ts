// Builds the 20-second "Catch me up" briefing from the computed match state.
// Templates only slot in numbers from matchMath.ts. They never invent or estimate one.

import { currentRunRate, formatRate, type MatchState } from './matchMath';
import type { Lang, Level, MatchMeta, Pressure } from './types';

export interface Briefing {
  standing: string; // where the match stands
  recent: string; // what happened in the last ~12 balls
  next: string; // one thing to watch next
}

const s = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type Template = (m: MatchState, meta: MatchMeta) => string;

// ---------- Where it stands ----------
const STANDING: Record<Lang, Record<Level, Template>> = {
  en: {
    beginner: (m, meta) =>
      `${meta.battingTeam} have scored ${s(m.runs, 'run', 'runs')} and lost ${s(m.wickets, 'wicket', 'wickets')}. ` +
      `To win, they need ${s(m.runsNeeded, 'more run', 'more runs')} from the last ${s(m.ballsLeft, 'ball', 'balls')}. ` +
      `That is about ${formatRate(m.rrr)} runs in every over (six balls).`,
    moderate: (m, meta) =>
      `${meta.battingTeam} are ${m.runs}/${m.wickets} after ${m.overs} overs, chasing ${meta.target}. ` +
      `They need ${m.runsNeeded} off ${s(m.ballsLeft, 'ball', 'balls')}: a required rate of ${formatRate(m.rrr)}.`,
    advanced: (m) =>
      `${m.runs}/${m.wickets} (${m.overs}), need ${m.runsNeeded} off ${m.ballsLeft}. ` +
      `RRR ${formatRate(m.rrr)} vs CRR ${formatRate(m.crr)}.`,
  },
  hinglish: {
    beginner: (m, meta) =>
      `${meta.battingTeam} ne ${m.runs} runs banaye hain aur ${m.wickets} wickets gir chuke hain. ` +
      `Jeetne ke liye bachi hui ${m.ballsLeft} balls mein ${m.runsNeeded} runs aur chahiye. ` +
      `Matlab har over (chhe balls) mein lagbhag ${formatRate(m.rrr)} runs.`,
    moderate: (m, meta) =>
      `${meta.battingTeam} ${m.overs} overs ke baad ${m.runs}/${m.wickets}, target ${meta.target}. ` +
      `${m.ballsLeft} balls mein ${m.runsNeeded} chahiye, required rate ${formatRate(m.rrr)}.`,
    advanced: (m) =>
      `${m.runs}/${m.wickets} (${m.overs}), ${m.ballsLeft} balls mein ${m.runsNeeded} chahiye. ` +
      `RRR ${formatRate(m.rrr)}, CRR ${formatRate(m.crr)}.`,
  },
};

// ---------- What happened recently ----------
const RECENT: Record<Lang, Record<Level, Template>> = {
  en: {
    beginner: ({ recent: r }) =>
      `In the last ${s(r.balls, 'ball', 'balls')}, they scored ${s(r.runs, 'run', 'runs')}` +
      (r.wickets ? ` but lost ${s(r.wickets, 'wicket', 'wickets')}.` : ' without losing a wicket.'),
    moderate: ({ recent: r }) =>
      `Last ${s(r.balls, 'ball', 'balls')}: ${s(r.runs, 'run', 'runs')}, ${s(r.wickets, 'wicket', 'wickets')}.`,
    advanced: ({ recent: r }) =>
      `Last ${r.balls}: ${r.runs}/${r.wickets} at ${formatRate(currentRunRate(r.runs, r.balls))} an over.`,
  },
  hinglish: {
    beginner: ({ recent: r }) =>
      `Pichhli ${r.balls} balls mein ${r.runs} runs bane` +
      (r.wickets ? `, par ${r.wickets} wicket bhi gire.` : ', aur koi wicket nahi gira.'),
    moderate: ({ recent: r }) => `Pichhli ${r.balls} balls: ${r.runs} runs, ${r.wickets} wicket.`,
    advanced: ({ recent: r }) =>
      `Pichhli ${r.balls}: ${r.runs}/${r.wickets}, ${formatRate(currentRunRate(r.runs, r.balls))} per over.`,
  },
};

// ---------- What to watch next (depends on pressure, never predicts a result) ----------
const NEXT: Record<Lang, Record<Level, Record<Pressure, string>>> = {
  en: {
    beginner: {
      calm: 'The team is scoring faster than it needs to. Watch whether they keep collecting easy runs without losing wickets.',
      building: 'The runs needed per over are creeping up. A boundary, a hit that reaches the rope, would ease the pressure a lot.',
      tense: 'Every ball matters now. A dot ball, where no run is scored, helps the bowlers. A four or a six helps the batters.',
      desperate: 'The batters must hit big almost every ball now. That means more risk, so wickets can fall quickly too.',
    },
    moderate: {
      calm: 'Ahead of the rate. Watch for steady singles and whether they avoid a collapse.',
      building: 'The asking rate is creeping above their scoring rate. One big over would swing it back.',
      tense: 'Every ball counts. Dot balls favour the bowlers; one boundary could turn it.',
      desperate: 'They need boundaries almost every over. Expect big swings, and wickets with them.',
    },
    advanced: {
      calm: 'Ahead of the rate. The fielding side needs wickets, so watch for attacking fields.',
      building: 'Asking rate edging ahead. Watch which bowler is being saved for the death.',
      tense: 'Yorkers against boundary options. Each dot ball shifts the equation.',
      desperate: 'Risk is forced now. The bowlers only need to hold their lengths.',
    },
  },
  hinglish: {
    beginner: {
      calm: 'Team zaroorat se tez run bana rahi hai. Dekho ki wo bina wicket khoye aasaan runs lete rehte hain ya nahi.',
      building: 'Har over mein chahiye wale runs dheere dheere badh rahe hain. Ek boundary, yaani rassi tak pahunchne wala shot, pressure bahut kam kar dega.',
      tense: 'Ab har ball important hai. Dot ball, jis pe koi run nahi bana, bowlers ki madad karti hai. Four ya six batters ki.',
      desperate: 'Ab batters ko lagbhag har ball pe bada shot maarna padega. Risk zyada hai, toh wickets bhi jaldi gir sakte hain.',
    },
    moderate: {
      calm: 'Rate se aage hain. Dekho singles chalte rehte hain aur collapse se bachte hain ya nahi.',
      building: 'Asking rate scoring rate se upar ja raha hai. Ek bada over sab theek kar sakta hai.',
      tense: 'Har ball count karti hai. Dot balls bowlers ke haq mein, ek boundary match palat sakti hai.',
      desperate: 'Lagbhag har over mein boundaries chahiye. Bade shots aayenge, aur unke saath wickets bhi.',
    },
    advanced: {
      calm: 'Rate se aage. Fielding side ko wickets chahiye, toh attacking fields dekho.',
      building: 'Asking rate aage nikal raha hai. Dekho death ke liye kaunsa bowler bachaya gaya hai.',
      tense: 'Yorkers vs boundary options. Har dot ball equation badal rahi hai.',
      desperate: 'Ab risk lena majboori hai. Bowlers ko bas apni length pakad ke rakhni hai.',
    },
  },
};

const FINISHED: Record<Lang, string> = {
  en: 'The match is over. Tap Restart to watch it again, or open Learned to revise the words you picked up.',
  hinglish: 'Match khatam. Dobara dekhne ke liye Restart dabao, ya Seekha kholke aaj ke words revise karo.',
};

// Once the chase is over, "need 0 off 1" reads oddly, so we summarise the finish instead.
const FINAL_STANDING: Record<Lang, Template> = {
  en: (m, meta) =>
    `${meta.battingTeam} finished on ${m.runs}/${m.wickets} in ${m.overs} overs, chasing ${meta.target}.`,
  hinglish: (m, meta) =>
    `${meta.battingTeam} ne ${m.overs} overs mein ${m.runs}/${m.wickets} banaye, target tha ${meta.target}.`,
};

export function buildCatchUp(m: MatchState, meta: MatchMeta, level: Level, lang: Lang): Briefing {
  return {
    standing: m.result === 'live' ? STANDING[lang][level](m, meta) : FINAL_STANDING[lang](m, meta),
    recent: RECENT[lang][level](m, meta),
    next: m.result === 'live' ? NEXT[lang][level][m.pressure] : FINISHED[lang],
  };
}
