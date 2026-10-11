"use client";

import * as React from "react";

/**
 * Recently-viewed history for destination / package detail pages.
 *
 * - Persisted to `localStorage` under `tt:recent`: newest-first array of
 *   {kind, id, title, href, at?}, capped at MAX_ITEMS, deduped by kind+id
 *   (re-viewing an item moves it back to the front).
 * - Module-level store (`useSyncExternalStore`) keeps every consumer in the
 *   same tab in sync; `storage` events sync other tabs.
 * - SSR-safe: the server snapshot is empty, so consumers render nothing until
 *   the client has read storage.
 */

export type RecentlyViewedKind = "destination" | "package";

export type RecentlyViewedEntry = {
  kind: RecentlyViewedKind;
  id: string;
  title: string;
  /** In-app path, must start with "/" (e.g. `/destinations/manali`). */
  href: string;
  /** Epoch ms of the view — stamped automatically by `trackView`. */
  at?: number;
};

const STORAGE_KEY = "tt:recent";
const MAX_ITEMS = 10;

type RecentlyViewedSnapshot = {
  items: readonly RecentlyViewedEntry[];
  ready: boolean;
};

const SERVER_SNAPSHOT: RecentlyViewedSnapshot = { items: [], ready: false };

let snapshot: RecentlyViewedSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: Partial<RecentlyViewedSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function sanitiseEntry(value: unknown): RecentlyViewedEntry | null {
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Record<string, unknown>;
  if (entry.kind !== "destination" && entry.kind !== "package") return null;
  if (typeof entry.id !== "string" || !entry.id.trim()) return null;
  if (typeof entry.title !== "string" || !entry.title.trim()) return null;
  if (typeof entry.href !== "string" || !entry.href.startsWith("/")) return null;
  return {
    kind: entry.kind,
    id: entry.id.trim(),
    title: entry.title.trim(),
    href: entry.href,
    ...(typeof entry.at === "number" ? { at: entry.at } : {}),
  };
}

/** Defensive parse of the stored array; keeps newest-first order and dedupes. */
function parseItems(raw: string | null): RecentlyViewedEntry[] {
  if (raw == null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const items: RecentlyViewedEntry[] = [];
    for (const value of parsed) {
      const entry = sanitiseEntry(value);
      if (!entry) continue;
      const key = `${entry.kind}:${entry.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(entry);
      if (items.length >= MAX_ITEMS) break;
    }
    return items;
  } catch {
    return [];
  }
}

function persist(items: readonly RecentlyViewedEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded / private mode — history is best-effort.
  }
}

function prepend(
  items: readonly RecentlyViewedEntry[],
  entry: RecentlyViewedEntry,
): readonly RecentlyViewedEntry[] {
  const rest = items.filter(
    (item) => !(item.kind === entry.kind && item.id === entry.id),
  );
  return [entry, ...rest].slice(0, MAX_ITEMS);
}

function handleStorage(event: StorageEvent) {
  if (event.key === null || event.key === STORAGE_KEY) {
    emit({ items: parseItems(event.newValue) });
  }
}

let initialised = false;

function ensureInitialised() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  emit({
    items: parseItems(window.localStorage.getItem(STORAGE_KEY)),
    ready: true,
  });
  window.addEventListener("storage", handleStorage);
}

function subscribe(listener: () => void) {
  ensureInitialised();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/**
 * Record a detail-page view. Standalone so it can be called from any client
 * component (detail pages typically call it in an effect). No-ops on the
 * server and for invalid entries.
 */
export function trackView(entry: RecentlyViewedEntry): void {
  if (typeof window === "undefined") return;
  ensureInitialised();
  const stamped = sanitiseEntry({ ...entry, at: Date.now() });
  if (!stamped) return;
  const items = prepend(snapshot.items, stamped);
  emit({ items });
  persist(items);
}

export function useRecentlyViewed() {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const track = React.useCallback((entry: RecentlyViewedEntry) => {
    trackView(entry);
  }, []);

  return {
    items: state.items,
    track,
    ready: state.ready,
  } as const;
}
