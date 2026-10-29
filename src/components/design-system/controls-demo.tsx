"use client";

import * as React from "react";
import { TravellerStepper } from "@/components/ui/stepper";
import { BudgetSlider, type BudgetRange } from "@/components/ui/slider";
import { ChipMultiSelect, type ChipOption } from "@/components/ui/chip-select";
import { RadioCards } from "@/components/ui/radio-cards";
import { DateRange, type DateRangeValue } from "@/components/ui/date-range";

const INTEREST_OPTIONS: ChipOption[] = [
  { value: "hills", label: "Hills" },
  { value: "beaches", label: "Beaches" },
  { value: "food", label: "Food" },
  { value: "culture", label: "Culture" },
  { value: "wildlife", label: "Wildlife" },
  { value: "disabled-demo", label: "Locked demo", disabled: true },
];

const STYLE_OPTIONS = [
  { value: "relaxed", label: "Relaxed", description: "Fewer stops, more downtime" },
  { value: "packed", label: "Packed", description: "See as much as possible" },
  { value: "balanced", label: "Balanced", description: "A bit of both" },
  { value: "locked", label: "Locked demo", description: "Disabled option", disabled: true },
];

/** Controlled form controls driven by local demo state only. */
export function ControlsDemo() {
  const [travellers, setTravellers] = React.useState(2);
  const [budget, setBudget] = React.useState<BudgetRange>({ min: 20000, max: 80000 });
  const [interests, setInterests] = React.useState<string[]>(["hills"]);
  const [style, setStyle] = React.useState("balanced");
  const [dates, setDates] = React.useState<DateRangeValue>({ from: "", to: "" });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs">
        <span className="label-brutal text-ink-soft">TravellerStepper</span>
        <TravellerStepper
          label="Travellers"
          unit="travellers"
          description="Demo counter (1–8)"
          min={1}
          max={8}
          value={travellers}
          onChange={setTravellers}
        />
      </div>

      <div className="grid gap-2">
        <span className="label-brutal text-ink-soft">DateRange</span>
        <DateRange label="Demo dates" value={dates} onChange={setDates} />
      </div>

      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs lg:col-span-2">
        <span className="label-brutal text-ink-soft">
          BudgetSlider — arbitrary demo units, not a real price
        </span>
        <BudgetSlider
          label="Demo budget range"
          min={0}
          max={200000}
          step={5000}
          value={budget}
          onChange={setBudget}
        />
      </div>

      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs lg:col-span-2">
        <span className="label-brutal text-ink-soft">ChipMultiSelect</span>
        <ChipMultiSelect
          label="Demo interests"
          options={INTEREST_OPTIONS}
          maxSelectable={3}
          value={interests}
          onChange={setInterests}
        />
      </div>

      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs lg:col-span-2">
        <span className="label-brutal text-ink-soft">RadioCards</span>
        <RadioCards
          name="design-system-demo-style"
          label="Demo travel style"
          options={STYLE_OPTIONS}
          value={style}
          onChange={setStyle}
        />
      </div>
    </div>
  );
}
