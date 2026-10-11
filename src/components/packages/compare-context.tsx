"use client";

import * as React from "react";
import { toast } from "sonner";
import type { PackageCard } from "@/lib/data/packages";

/** Hard cap for the compare tray — the comparison table stays readable at 3. */
export const COMPARE_LIMIT = 3;

export type CompareContextValue = {
  /** False when no provider is mounted (tiles then render without a compare toggle). */
  enabled: boolean;
  selected: PackageCard[];
  isSelected: (id: string) => boolean;
  toggle: (pkg: PackageCard) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const noop = () => {};

/** Used outside a provider so tiles can render on detail pages unchanged. */
const detachedContext: CompareContextValue = {
  enabled: false,
  selected: [],
  isSelected: () => false,
  toggle: noop,
  remove: noop,
  clear: noop,
};

const CompareContext = React.createContext<CompareContextValue>(detachedContext);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<PackageCard[]>([]);

  const remove = React.useCallback(
    (id: string) => setSelected((list) => list.filter((item) => item.id !== id)),
    [],
  );

  const clear = React.useCallback(() => setSelected([]), []);

  // Toast lives outside the state updater so React never runs it twice.
  const toggle = React.useCallback(
    (pkg: PackageCard) => {
      const exists = selected.some((item) => item.id === pkg.id);
      if (exists) {
        setSelected((list) => list.filter((item) => item.id !== pkg.id));
        return;
      }
      if (selected.length >= COMPARE_LIMIT) {
        toast.info(`Compare up to ${COMPARE_LIMIT} packages`);
        return;
      }
      setSelected((list) => (list.length >= COMPARE_LIMIT ? list : [...list, pkg]));
    },
    [selected],
  );

  const value = React.useMemo<CompareContextValue>(() => {
    const ids = new Set(selected.map((item) => item.id));
    return {
      enabled: true,
      selected,
      isSelected: (id: string) => ids.has(id),
      toggle,
      remove,
      clear,
    };
  }, [selected, toggle, remove, clear]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

/** Read the compare tray state. Safe outside a provider (returns a disabled stub). */
export function useCompare(): CompareContextValue {
  return React.useContext(CompareContext);
}
