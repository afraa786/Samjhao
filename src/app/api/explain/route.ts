// Optional live AI. The app works fully without this: if no key is configured, or
// anything at all goes wrong, we answer { source: 'static' } and the browser keeps
// showing the pre-written text. The fan never sees an error.
//
// Safety by design:
// - The body holds ids, a level, a language and computed numbers. No free text from
//   the user is ever accepted, so there is nothing to inject a prompt through.
// - The model is told to use ONLY the facts we send, and the facts are our own
//   pre-written, reviewed text plus numbers computed in matchMath.ts.
// - The key is read on the server only and is never logged or returned.

import { creatorById, termsById } from '@/lib/data';
import { creatorMeaning, creatorText, LANGS, LEVELS, termExplanation } from '@/lib/explain';
import type { Lang, Level, Pressure } from '@/lib/types';

const TIMEOUT_MS = 8000;
const WORD_LIMIT: Record<Level, string> = {
  beginner: '40 to 70 words',
  moderate: '20 to 35 words',
  advanced: '10 to 25 words',
};
const STATE_NUMBERS = [
  'runs', 'wickets', 'balls', 'ballsLeft', 'runsNeeded', 'target', 'rrr', 'crr',
  'recentRuns', 'recentWickets', 'recentBalls',
] as const;
const PRESSURES: Pressure[] = ['calm', 'building', 'tense', 'desperate'];

const SYSTEM_PROMPT = [
  'You explain cricket to a newcomer who is watching a live creator watch-along on their phone.',
  'Use ONLY the facts and numbers provided in the JSON. Never invent scores, players, events or numbers.',
  'Match the requested level and language exactly. "hinglish" means Roman-script Hindi mixed with English, the way people text in India.',
  'Stay within the word limit for the level. Be warm, never condescending.',
  'No betting, no odds, no predictions of who will win.',
  'Reply with the explanation text only: no heading, no quotes, no markdown.',
].join(' ');

// ---------- Tiny in-memory rate limit (per IP, per server instance) ----------
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) hits.clear(); // keep memory bounded on a long-lived instance
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

// ---------- Input validation ----------
interface ExplainInput {
  kind: 'term' | 'creator' | 'catchup';
  id: string;
  level: Level;
  lang: Lang;
  state: Record<string, number | string | null>;
}

function validState(raw: unknown): Record<string, number | string | null> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const input = raw as Record<string, unknown>;
  const out: Record<string, number | string | null> = {};
  for (const key of STATE_NUMBERS) {
    const v = input[key];
    // rrr is null when the chase can no longer be completed (no balls left).
    if (key === 'rrr' && v === null) out[key] = null;
    else if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 10_000) out[key] = v;
    else return null;
  }
  if (!PRESSURES.includes(input.pressure as Pressure)) return null;
  out.pressure = input.pressure as Pressure;
  return out;
}

function parseInput(body: unknown): ExplainInput | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (!LEVELS.includes(b.level as Level) || !LANGS.includes(b.lang as Lang)) return null;
  if (typeof b.id !== 'string' || b.id.length > 40) return null;
  const base = { id: b.id, level: b.level as Level, lang: b.lang as Lang };

  if (b.kind === 'term' && termsById.has(b.id)) return { kind: 'term', ...base, state: {} };
  if (b.kind === 'creator' && creatorById.has(b.id)) return { kind: 'creator', ...base, state: {} };
  if (b.kind === 'catchup' && /^m\d{1,3}$/.test(b.id)) {
    const state = validState(b.state);
    return state ? { kind: 'catchup', ...base, state } : null;
  }
  return null;
}

/** The facts the model is allowed to use: our own reviewed text, plus computed numbers. */
function factsFor(input: ExplainInput) {
  const common = { level: input.level, language: input.lang, wordLimit: WORD_LIMIT[input.level] };
  if (input.kind === 'term') {
    const term = termsById.get(input.id)!;
    return {
      ...common,
      task: 'Explain this cricket term in fresh words, keeping exactly the same facts.',
      term: term.label.en,
      reviewedExplanation: termExplanation(term, input.level, 'en'),
    };
  }
  if (input.kind === 'creator') {
    const line = creatorById.get(input.id)!;
    return {
      ...common,
      task: 'Explain what the creator meant by this line, keeping exactly the same facts.',
      creatorSaid: creatorText(line, 'en'),
      reviewedMeaning: creatorMeaning(line, input.level, 'en'),
    };
  }
  return {
    ...common,
    wordLimit: 'at most 70 words',
    task: 'Brief the fan in three short parts: where the chase stands, what happened in the recent balls, and one thing to watch next. Use only these numbers.',
    battingTeam: 'Mumbai Mariners',
    numbers: input.state,
  };
}

// ---------- Providers (plain fetch, no SDK) ----------
async function callAnthropic(key: string, model: string, facts: object, signal: AbortSignal) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(facts) }],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { stop_reason?: string; content?: { type: string; text?: string }[] };
  if (data.stop_reason === 'refusal') return null; // fall back to the pre-written text
  // Newer models may return thinking blocks first, so pick the text blocks by type.
  return (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim() || null;
}

async function callOpenAI(key: string, model: string, facts: object, signal: AbortSignal) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_completion_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(facts) },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

// ---------- Handler ----------
const staticReply = (reason: string) => Response.json({ source: 'static', reason });

export async function POST(request: Request) {
  const key = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER;
  const model = process.env.LLM_MODEL;
  if (!key || !model || (provider !== 'anthropic' && provider !== 'openai')) return staticReply('no-key');

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) return staticReply('rate-limited');

  let input: ExplainInput | null = null;
  try {
    input = parseInput(await request.json());
  } catch {
    input = null;
  }
  if (!input) return staticReply('invalid');

  try {
    const facts = factsFor(input);
    const signal = AbortSignal.timeout(TIMEOUT_MS);
    const text =
      provider === 'anthropic'
        ? await callAnthropic(key, model, facts, signal)
        : await callOpenAI(key, model, facts, signal);
    // Last guard: a very long answer is a sign something went off-script.
    if (!text || text.length > 900) return staticReply('fallback');
    return Response.json({ source: 'live', text });
  } catch {
    // Timeout, network error, bad JSON... all end the same way. Nothing is logged, so the key never is.
    return staticReply('fallback');
  }
}
