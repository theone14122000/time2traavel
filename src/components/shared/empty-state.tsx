import * as React from "react";
import { cn } from "@/lib/utils";
import { renderHeading } from "@/lib/render-heading";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tone?: "butter" | "mint" | "sky" | "peach" | "lavender" | "cream" | "paper";
  icon?: React.ReactNode;
  /** Kept for call-site compatibility — the luxury theme uses no illustration. */
  illustration?: "compass" | "luggage" | "map" | "search" | "default";
};

const tones: Record<NonNullable<EmptyStateProps["tone"]>, string> = {
  butter: "bg-butter",
  mint: "bg-mint",
  sky: "bg-sky",
  peach: "bg-peach",
  lavender: "bg-lavender",
  cream: "bg-cream",
  paper: "bg-paper",
};

/**
 * Honest empty state — shown whenever the database has no content yet.
 * Compact, typographic, always paired with a working action.
 */
export function EmptyState({
  eyebrow = "Nothing here yet",
  title,
  description,
  action,
  className,
  tone = "paper",
  icon,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-line px-6 py-10 text-center sm:py-14",
        tones[tone],
        className,
      )}
    >
      {icon ? (
        <div aria-hidden="true" className="text-bronze">
          {icon}
        </div>
      ) : null}

      <span className="lux-eyebrow">{eyebrow}</span>

      <h3 className="max-w-[24ch] font-display text-h3 text-ink">
        {renderHeading(title, "ink")}
      </h3>

      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
