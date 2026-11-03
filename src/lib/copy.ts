// Interface wording in both languages. Numbers are always passed in as arguments
// (computed in matchMath.ts), never typed into these strings.

import type { Lang, Level, Pressure } from './types';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const en = {
  tagline: 'Cricket, explained at your level',
  live: 'LIVE',
  momentOf: (n: number, total: number) => `Moment ${n} of ${total}`,
  restart: 'Restart',
  next: 'Next moment',
  catchUp: 'Catch me up',
  matchMenu: 'Match menu',
  watchAgain: 'Watch again',
  learned: 'Learned',
  levelGroup: 'Explanation level',
  langGroup: 'Language',
  levels: { beginner: 'Beginner', moderate: 'Moderate', advanced: 'Advanced' } as Record<Level, string>,
  chasing: 'Chasing',
  need: (runs: number, balls: number) => `Need ${runs} off ${plural(balls, 'ball', 'balls')}`,
  overs: 'overs',
  reqRate: 'Required rate',
  runRate: 'Run rate',
  pressure: { calm: 'Calm', building: 'Building', tense: 'Tense', desperate: 'Desperate' } as Record<Pressure, string>,
  pressureLabel: 'Pressure',
  tapToLearn: (what: string) => `What is ${what}?`,
  overBall: (overs: string) => `Over ${overs}`,
  sinceLast: (runs: number, balls: number, wickets: number) =>
    `Since the last moment: ${plural(runs, 'run', 'runs')} off ${plural(balls, 'ball', 'balls')}` +
    (wickets ? `, ${plural(wickets, 'wicket', 'wickets')}` : ''),
  alsoHere: 'Also in this moment',
  creatorRole: 'Creator · live',
  creatorCta: 'What does this mean?',
  nudge: 'Confused? Tap to understand:',
  close: 'Close',
  simpler: 'Show simpler',
  deeper: 'Go deeper',
  fullExplanation: 'Full explanation',
  alreadyLearned: 'You learned this earlier',
  sourceStatic: 'Pre-written',
  sourceLive: 'Live AI',
  creatorMeant: 'What Bhai Cric meant',
  wordsInLine: 'Words in this line',
  learnedTitle: 'Learned today',
  learnedEmpty: 'Nothing here yet. Tap any underlined word during the match and it will show up here.',
  learnedHint: 'Tap a word for a quick reminder.',
  reset: 'Reset',
  catchUpTitle: 'Catch me up',
  catchUpStanding: 'Where it stands',
  catchUpRecent: 'Recently',
  catchUpNext: 'What to watch next',
  won: (team: string, wicketsInHand: number, ballsLeft: number) =>
    `${team} win by ${plural(wicketsInHand, 'wicket', 'wickets')}` +
    (ballsLeft ? `, with ${plural(ballsLeft, 'ball', 'balls')} to spare` : ', off the final ball'),
  lost: (team: string, short: number) => `${team} fall short by ${plural(short, 'run', 'runs')}`,
  tied: 'The match is tied',
  matchOver: 'Full time',
  youLearned: (n: number) =>
    n === 0
      ? 'Next time, tap an underlined word. Samjhao explains it at your level.'
      : `You learned ${plural(n, 'cricket word', 'cricket words')} today. Next match will make more sense.`,
  welcomeTitle: 'Lost in the watch-along? Samjhao.',
  welcomeBody:
    'The match moves fast and the creator talks in jargon. Tap any underlined word, or anything the creator says, and get it explained privately. Nobody else sees what you ask.',
  welcomeAsk: 'How much cricket do you know?',
  welcomeLevels: {
    beginner: 'I am new. Explain everything.',
    moderate: 'I know runs, wickets and overs.',
    advanced: 'I follow cricket. Give me the tactics.',
  } as Record<Level, string>,
  welcomeStart: 'Start watching',
  welcomeLater: 'You can change this anytime from the top bar.',
};

export type Copy = typeof en;

const hinglish: Copy = {
  tagline: 'Cricket, aapke level pe samjhaya',
  live: 'LIVE',
  momentOf: (n, total) => `Moment ${n} / ${total}`,
  restart: 'Restart',
  next: 'Agla moment',
  catchUp: 'Ab tak kya hua?',
  matchMenu: 'Match menu',
  watchAgain: 'Phir se dekho',
  learned: 'Seekha',
  levelGroup: 'Explanation ka level',
  langGroup: 'Bhasha',
  levels: { beginner: 'Beginner', moderate: 'Moderate', advanced: 'Advanced' },
  chasing: 'Target',
  need: (runs, balls) => `${balls} balls mein ${runs} chahiye`,
  overs: 'overs',
  reqRate: 'Required rate',
  runRate: 'Run rate',
  pressure: { calm: 'Aaram se', building: 'Badh raha', tense: 'Tension', desperate: 'Bahut mushkil' },
  pressureLabel: 'Pressure',
  tapToLearn: (what) => `${what} kya hai?`,
  overBall: (overs) => `Over ${overs}`,
  sinceLast: (runs, balls, wickets) =>
    `Pichhle moment se: ${balls} balls mein ${runs} runs` + (wickets ? `, ${wickets} wicket` : ''),
  alsoHere: 'Is moment mein aur',
  creatorRole: 'Creator · live',
  creatorCta: 'Iska matlab kya hai?',
  nudge: 'Confused? Tap karke samjho:',
  close: 'Band karo',
  simpler: 'Aur aasaan',
  deeper: 'Aur detail',
  fullExplanation: 'Poori explanation',
  alreadyLearned: 'Ye aap pehle seekh chuke ho',
  sourceStatic: 'Pre-written',
  sourceLive: 'Live AI',
  creatorMeant: 'Bhai Cric ka matlab',
  wordsInLine: 'Is line ke words',
  learnedTitle: 'Aaj seekha',
  learnedEmpty: 'Abhi kuch nahi. Match ke dauraan koi bhi underlined word tap karo, wo yahan aa jayega.',
  learnedHint: 'Jaldi yaad karne ke liye word pe tap karo.',
  reset: 'Reset',
  catchUpTitle: 'Ab tak kya hua?',
  catchUpStanding: 'Abhi ka scene',
  catchUpRecent: 'Pichhli kuch balls',
  catchUpNext: 'Aage kya dekhna hai',
  won: (team, wicketsInHand, ballsLeft) =>
    `${team} ${wicketsInHand} wicket se jeet gaye` +
    (ballsLeft ? `, ${ballsLeft} ball bacha ke` : ', aakhri ball pe'),
  lost: (team, short) => `${team} ${short} runs se haar gaye`,
  tied: 'Match tie ho gaya',
  matchOver: 'Match khatam',
  youLearned: (n) =>
    n === 0
      ? 'Agli baar koi underlined word tap karo. Samjhao aapke level pe samjhayega.'
      : `Aaj aapne ${n} cricket words seekhe. Agla match aur achhe se samajh aayega.`,
  welcomeTitle: 'Watch-along mein kho gaye? Samjhao.',
  welcomeBody:
    'Match tez chalta hai aur creator jargon mein bolte hain. Koi bhi underlined word, ya creator ki koi bhi line tap karo, aur private mein samjho. Aap kya poochte ho, kisi aur ko nahi dikhta.',
  welcomeAsk: 'Aapko cricket kitna aata hai?',
  welcomeLevels: {
    beginner: 'Bilkul new hoon. Sab kuch samjhao.',
    moderate: 'Runs, wickets, overs pata hai.',
    advanced: 'Cricket follow karte hain. Tactics batao.',
  },
  welcomeStart: 'Match dekhna shuru karo',
  welcomeLater: 'Ye aap upar wale bar se kabhi bhi badal sakte ho.',
};

export const COPY: Record<Lang, Copy> = { en, hinglish };
