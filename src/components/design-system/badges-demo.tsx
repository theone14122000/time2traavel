"use client";

import * as React from "react";
import { Badge, Ribbon, Stamp, TagChip } from "@/components/ui/badge";

const BADGE_VARIANTS = [
  "default",
  "tomato",
  "sunrise",
  "mint",
  "sky",
  "peach",
  "lavender",
  "blush",
  "sand",
  "dark",
  "outline",
  "soft",
  "mint-strong",
  "sky-strong",
  "coral",
  "danger",
  "success",
] as const;

const BADGE_SIZES = ["sm", "md", "lg"] as const;

const STAMPS = [
  { rotate: -12, variant: "tomato" as const },
  { rotate: -6, variant: "default" as const },
  { rotate: 4, variant: "mint" as const },
  { rotate: 9, variant: "sky" as const },
  { rotate: -3, variant: "dark" as const },
];

const CHIPS = ["Beaches", "Hills", "Food", "Culture", "Wildlife"];

/** Badge palette × sizes, rotated stamps, ribbons and toggleable chips. */
export function BadgesDemo() {
  const [active, setActive] = React.useState<string[]>(["Hills"]);

  const toggle = (chip: string) => {
    setActive((current) =>
      current.includes(chip)
        ? current.filter((entry) => entry !== chip)
        : [...current, chip],
    );
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <span className="label-brutal text-ink-soft">Badge — variants × sizes</span>
        <div className="border-[3px] border-ink bg-paper p-4 shadow-hard-xs">
          <ul className="grid gap-3">
            {BADGE_VARIANTS.map((variant) => (
              <li
                key={variant}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-dashed border-ink/40 pb-3 last:border-0 last:pb-0"
              >
                <code className="w-28 shrink-0 text-[0.68rem] font-bold text-ink-soft">
                  {variant}
                </code>
                {BADGE_SIZES.map((size) => (
                  <Badge key={size} variant={variant} size={size}>
                    Demo
                  </Badge>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-3 border-[3px] border-ink bg-paper p-4 shadow-hard-xs">
          <span className="label-brutal text-ink-soft">Stamp — rotations</span>
          <div className="flex flex-wrap items-center gap-5 py-3">
            {STAMPS.map((stamp) => (
              <Stamp key={`${stamp.variant}-${stamp.rotate}`} variant={stamp.variant} rotate={stamp.rotate}>
                Demo
              </Stamp>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-[3px] border-ink bg-paper p-4 shadow-hard-xs">
          <span className="label-brutal text-ink-soft">Ribbon — edge callouts</span>
          <div className="flex flex-wrap items-end gap-4 py-3">
            <Ribbon variant="tomato">Demo</Ribbon>
            <Ribbon variant="mint">Demo</Ribbon>
            <Ribbon variant="sky-strong">Demo</Ribbon>
            <Ribbon variant="dark">Demo</Ribbon>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-[3px] border-ink bg-paper p-4 shadow-hard-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label-brutal text-ink-soft">TagChip — interactive toggle</span>
          <span className="text-xs font-semibold text-ink-soft" aria-live="polite">
            {active.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <TagChip
              key={chip}
              active={active.includes(chip)}
              onClick={() => toggle(chip)}
            >
              {chip}
            </TagChip>
          ))}
        </div>
      </div>
    </div>
  );
}
