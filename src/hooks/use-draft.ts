"use client";

import * as React from "react";

const STORAGE_PREFIX = "tt:draft:";
const WRITE_DEBOUNCE_MS = 400;

function storageKeyFor(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Persist a JSON-serialisable draft to `localStorage` (debounced writes).
 *
 * Pattern:
 * - `value` starts as `initial` and is replaced once on mount (`hydrated`
 *   flips to `true` when that read is done) — SSR safe, quota errors ignored.
 * - `setValue` accepts a value or updater, same contract as `useState`.
 * - `clear()` wipes the stored draft and resets `value` back to `initial`.
 *
 * Callers own *when* a restored draft is applied (e.g. only when a dialog
 * opens and no server-provided initial override exists).
 */
export function useDraft<T>(key: string, initial: T) {
  const storageKey = storageKeyFor(key);
  const initialRef = React.useRef(initial);

  const [value, setValueState] = React.useState<T>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  // Read once on mount (client only).
  React.useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw != null && !cancelled) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed != null) setValueState(parsed as T);
      }
    } catch {
      // Corrupt JSON / disabled storage — fall back to the initial value.
    }
    if (!cancelled) setHydrated(true);
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  // Debounced write.
  React.useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // Quota exceeded / private mode — drafts are best-effort.
      }
    }, WRITE_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [value, hydrated, storageKey]);

  const setValue = React.useCallback((next: T | ((prev: T) => T)) => {
    setValueState((prev) =>
      typeof next === "function" ? (next as (prevValue: T) => T)(prev) : next,
    );
  }, []);

  const clear = React.useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore — storage may be unavailable.
    }
    setValueState(initialRef.current);
  }, [storageKey]);

  return { value, setValue, clear, hydrated } as const;
}
