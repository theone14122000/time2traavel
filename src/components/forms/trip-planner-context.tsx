"use client";

import * as React from "react";
import { TripPlanner, type TripPlannerInitial } from "@/components/forms/trip-planner";

type TripPlannerContextValue = {
  openPlanner: (initial?: TripPlannerInitial) => void;
};

const TripPlannerContext = React.createContext<TripPlannerContextValue | null>(null);

/**
 * Provides a global "Plan My Trip" dialog trigger so the hero, header,
 * mobile menu and CTA bands can all open the same multi-step planner.
 */
export function TripPlannerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [initial, setInitial] = React.useState<TripPlannerInitial | undefined>(undefined);

  const value = React.useMemo<TripPlannerContextValue>(
    () => ({
      openPlanner: (next) => {
        setInitial(next);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <TripPlannerContext.Provider value={value}>
      {children}
      <TripPlanner open={open} onOpenChange={setOpen} initial={initial} />
    </TripPlannerContext.Provider>
  );
}

export function useTripPlanner(): TripPlannerContextValue {
  const ctx = React.useContext(TripPlannerContext);
  if (!ctx) {
    throw new Error("useTripPlanner must be used inside <TripPlannerProvider>");
  }
  return ctx;
}
