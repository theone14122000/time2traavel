"use client";

import * as React from "react";
import { FloatingInput } from "@/components/ui/floating-input";
import { DateRange, type DateRangeValue } from "@/components/ui/date-range";
import { TravellerStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { FormLiveRegion } from "@/components/ui/form-status";

/**
 * Small integrated form: floating field + date range + traveller stepper +
 * submit that only flips a live-region success message client-side.
 */
export function IntegratedFormDemo() {
  const [name, setName] = React.useState("");
  const [dates, setDates] = React.useState<DateRangeValue>({ from: "", to: "" });
  const [travellers, setTravellers] = React.useState(2);
  const [status, setStatus] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(
      `Demo form submitted for ${name.trim() || "the demo traveller"} — nothing was sent anywhere.`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
      <FormLiveRegion message={status} type={status ? "success" : "info"} />

      <FloatingInput
        label="Demo traveller name"
        autoComplete="off"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setStatus(null);
        }}
      />

      <DateRange
        label="Demo travel dates"
        value={dates}
        onChange={(next) => {
          setDates(next);
          setStatus(null);
        }}
      />

      <TravellerStepper
        label="Demo travellers"
        unit="travellers"
        min={1}
        max={8}
        value={travellers}
        onChange={setTravellers}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg">
          Submit demo form
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setName("");
            setDates({ from: "", to: "" });
            setTravellers(2);
            setStatus(null);
          }}
        >
          Reset demo
        </Button>
      </div>

      <p className="text-sm font-medium text-ink-soft">
        Component interaction demo only — the submit handler is local and never
        contacts a server.
      </p>
    </form>
  );
}
