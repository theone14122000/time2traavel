import * as React from "react";
import { cn } from "@/lib/utils";

const tones = {
  paper: "bg-paper",
  butter: "bg-butter",
  mint: "bg-mint",
  sky: "bg-sky",
  peach: "bg-peach",
  lavender: "bg-lavender",
} as const;

/** Big number tile for real DB counts on the dashboard. */
export function StatCard({
  label,
  value,
  hint,
  tone = "paper",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border border-line p-4 shadow-hard",
        tones[tone],
        className,
      )}
    >
      <span className="label-brutal text-ink-soft">{label}</span>
      <span className="font-display text-4xl leading-none">{value}</span>
      {hint ? (
        <span className="text-xs font-semibold text-ink-soft">{hint}</span>
      ) : null}
    </div>
  );
}
