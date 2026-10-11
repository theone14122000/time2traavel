"use client";

import { TripPlanner } from "@/components/forms/trip-planner";

/** Client wrapper so server pages can embed the planner without passing event handlers across the boundary. */
export function TripPlannerStandalone({ tripTypes }: { tripTypes: string[] }) {
  return <TripPlanner open onOpenChange={() => {}} standalone tripTypes={tripTypes} />;
}
