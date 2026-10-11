"use client";

import * as React from "react";

const DESTINATION_KEY = "tt:saved:destinations";
const PACKAGE_KEY = "tt:saved:packages";
const SYNC_EVENT = "tt:saved:sync";

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode / quota) — wishlist stays in-memory.
  }
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

/**
 * Local-first wishlist over localStorage. IDs only — resolved server-side by
 * `getSavedItemsAction`. `ready` is false until the store is hydrated so the
 * heart buttons never mismatch server HTML.
 */
export function useWishlist() {
  const [destinationIds, setDestinationIds] = React.useState<string[]>([]);
  const [packageIds, setPackageIds] = React.useState<string[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setDestinationIds(readIds(DESTINATION_KEY));
    setPackageIds(readIds(PACKAGE_KEY));
    setReady(true);

    function onStorage(event: StorageEvent) {
      if (event.key === DESTINATION_KEY) setDestinationIds(readIds(DESTINATION_KEY));
      if (event.key === PACKAGE_KEY) setPackageIds(readIds(PACKAGE_KEY));
    }
    function onSync() {
      setDestinationIds(readIds(DESTINATION_KEY));
      setPackageIds(readIds(PACKAGE_KEY));
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(SYNC_EVENT, onSync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SYNC_EVENT, onSync);
    };
  }, []);

  const toggleDestination = React.useCallback((id: string) => {
    setDestinationIds((current) => {
      const next = toggleId(current, id);
      writeIds(DESTINATION_KEY, next);
      window.dispatchEvent(new Event(SYNC_EVENT));
      return next;
    });
  }, []);

  const togglePackage = React.useCallback((id: string) => {
    setPackageIds((current) => {
      const next = toggleId(current, id);
      writeIds(PACKAGE_KEY, next);
      window.dispatchEvent(new Event(SYNC_EVENT));
      return next;
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setDestinationIds([]);
    setPackageIds([]);
    writeIds(DESTINATION_KEY, []);
    writeIds(PACKAGE_KEY, []);
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

  return {
    ready,
    hydrated: ready,
    destinations: destinationIds,
    packages: packageIds,
    destinationIds,
    packageIds,
    toggleDestination,
    togglePackage,
    clearAll,
    hasDestination: (id: string) => destinationIds.includes(id),
    hasPackage: (id: string) => packageIds.includes(id),
    isSavedDestination: (id: string) => destinationIds.includes(id),
    isSavedPackage: (id: string) => packageIds.includes(id),
  };
}
