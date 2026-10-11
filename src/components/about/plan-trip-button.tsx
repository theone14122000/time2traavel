"use client";

import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripPlanner } from "@/components/forms/trip-planner-context";

/** Opens the global multi-step trip planner dialog. */
export function PlanTripButton({ className }: { className?: string }) {
  const { openPlanner } = useTripPlanner();

  return (
    <Button
      type="button"
      size="lg"
      className={className}
      onClick={() => openPlanner()}
    >
      <Compass aria-hidden="true" className="size-4" />
      Plan My Trip
    </Button>
  );
}
