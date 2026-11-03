// localStorage can throw (Safari private mode, blocked cookies, quota) or be missing
// entirely (server render). Every access goes through these helpers so the app keeps
// working with nothing saved instead of crashing.

import { useCallback, useSyncExternalStore } from 'react';

const PREFIX = 'samjhao:';

export function readStored<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the choice still works for this visit, it just won't be remembered.
  }
}

// ---------- React hook ----------
// Saved settings live in a tiny in-memory store that mirrors localStorage.
// - The server render and first hydration use the fallback, so there is no mismatch.
// - If storage is blocked, the in-memory copy still updates, so toggles keep working.
const memory = new Map<string, unknown>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePersisted<T>(
  key: string,
  fallback: T,
  isValid: (v: unknown) => v is T,
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      // Read storage once, then keep returning the same object so React sees a stable value.
      if (!memory.has(key)) memory.set(key, readStored(key, fallback, isValid));
      return memory.get(key) as T;
    },
    () => fallback,
  );
  const setValue = useCallback(
    (next: T) => {
      memory.set(key, next);
      writeStored(key, next);
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [value, setValue];
}

// Small type guards used when reading saved values back.
export const isOneOf =
  <T extends string>(options: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === 'string' && (options as readonly string[]).includes(v);

export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';
