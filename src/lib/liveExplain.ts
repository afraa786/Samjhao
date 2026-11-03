'use client';

// Optional live AI, as a progressive enhancement. The pre-written text is always
// shown first; if /api/explain returns a live version we swap it in. Any failure
// just leaves the pre-written text in place: the fan never sees an error.

import { useEffect, useState } from 'react';
import type { Lang, Level } from './types';

export interface LiveRequest {
  kind: 'term' | 'creator' | 'catchup';
  id: string;
  level: Level;
  lang: Lang;
  state?: Record<string, number | string | null>; // computed numbers only, never free text
}

const cache = new Map<string, string>();
// Once the server says "no key configured", stop asking for the rest of the visit.
let staticMode = false;

async function fetchLive(req: LiveRequest): Promise<string | null> {
  if (staticMode) return null;
  const key = JSON.stringify(req);
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: key,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (typeof data !== 'object' || data === null) return null;
    const { source, text } = data as { source?: string; text?: unknown };
    if (source === 'static' && (data as { reason?: string }).reason === 'no-key') staticMode = true;
    if (source !== 'live' || typeof text !== 'string' || !text.trim()) return null;
    cache.set(key, text);
    return text;
  } catch {
    return null;
  }
}

/** Returns live text for this request once it arrives, otherwise null (show the pre-written text). */
export function useLiveText(req: LiveRequest | null): string | null {
  const key = req ? JSON.stringify(req) : null;
  const [result, setResult] = useState<{ key: string; text: string } | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    fetchLive(JSON.parse(key) as LiveRequest).then((text) => {
      if (alive && text) setResult({ key, text });
    });
    return () => {
      alive = false;
    };
  }, [key]);

  // Only use a result that belongs to the current request (level or language may have changed).
  return result && result.key === key ? result.text : null;
}
