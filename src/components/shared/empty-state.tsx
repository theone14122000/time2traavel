import * as React from "react";
import { cn } from "@/lib/utils";
import { renderHeading } from "@/lib/render-heading";

type EmptyStateIllustration = "compass" | "luggage" | "map" | "search" | "default";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tone?: "butter" | "mint" | "sky" | "peach" | "lavender" | "cream" | "paper";
  icon?: React.ReactNode;
  /** Pure-SVG illustration shown above the eyebrow. Defaults to `compass`. */
  illustration?: EmptyStateIllustration;
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

const illustrationAccents: Record<NonNullable<EmptyStateProps["tone"]>, string> = {
  butter: "text-sky",
  mint: "text-blush",
  sky: "text-peach",
  peach: "text-mint",
  lavender: "text-lemon",
  cream: "text-lavender",
  paper: "text-mint",
};

function CompassIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 112"
      className="size-24 -rotate-6 text-ink"
      fill="none"
    >
      <circle cx="56" cy="56" r="40" className="fill-mint stroke-current" strokeWidth={3} />
      <circle cx="56" cy="56" r="40" stroke="currentColor" strokeWidth={3} />
      <polygon points="56,28 64,56 56,84 48,56" className="fill-tomato stroke-current" strokeWidth={3} strokeLinejoin="round" />
      <circle cx="56" cy="56" r="5" className="fill-lemon stroke-current" strokeWidth={2} />
    </svg>
  );
}

function LuggageIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 112"
      className="size-24 rotate-6 text-ink"
      fill="none"
    >
      <rect x="38" y="14" width="36" height="14" className="fill-paper stroke-current" strokeWidth={3} />
      <rect x="18" y="28" width="76" height="64" className="fill-peach stroke-current" strokeWidth={3} />
      <line x1="36" y1="28" x2="36" y2="92" stroke="currentColor" strokeWidth={3} />
      <line x1="76" y1="28" x2="76" y2="92" stroke="currentColor" strokeWidth={3} />
      <line x1="18" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth={3} />
      <circle cx="36" cy="50" r="4" className="fill-lemon stroke-current" strokeWidth={2} />
      <circle cx="76" cy="50" r="4" className="fill-lemon stroke-current" strokeWidth={2} />
    </svg>
  );
}

function MapIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 112"
      className="size-24 -rotate-3 text-ink"
      fill="none"
    >
      <polygon points="8,28 38,16 74,28 104,16 104,84 74,96 38,84 8,96" className="fill-sky stroke-current" strokeWidth={3} strokeLinejoin="round" />
      <line x1="38" y1="16" x2="38" y2="84" stroke="currentColor" strokeWidth={3} />
      <line x1="74" y1="28" x2="74" y2="96" stroke="currentColor" strokeWidth={3} />
      <circle cx="56" cy="52" r="10" className="fill-tomato stroke-current" strokeWidth={3} />
      <circle cx="56" cy="52" r="3" className="fill-paper" />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 112"
      className="size-24 rotate-3 text-ink"
      fill="none"
    >
      <circle cx="48" cy="48" r="28" className="fill-lavender stroke-current" strokeWidth={3} />
      <line x1="68" y1="68" x2="94" y2="94" stroke="currentColor" strokeWidth={6} strokeLinecap="square" />
      <polygon points="86,14 90,26 102,30 90,34 86,46 82,34 70,30 82,26" className="fill-lemon stroke-current" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

const illustrations: Record<EmptyStateIllustration, () => React.JSX.Element> = {
  compass: CompassIllustration,
  luggage: LuggageIllustration,
  map: MapIllustration,
  search: SearchIllustration,
  default: CompassIllustration,
};

/**
 * The standard brutalist empty state — shown whenever the database has no
 * content yet (e.g. "Packages coming soon").
 */
export function EmptyState({
  eyebrow = "Nothing here yet",
  title,
  description,
  action,
  className,
  tone = "paper",
  icon,
  illustration = "default",
}: EmptyStateProps) {
  const Illustration = illustrations[illustration] ?? CompassIllustration;

  return (
    <div
      role="status"
      className={cn(
        "relative flex flex-col items-center gap-4 border-[3px] border-dashed border-ink px-6 py-12 text-center shadow-hard sm:py-16",
        tones[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 size-4 border-b-[3px] border-r-[3px] border-ink bg-ink"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 size-4 border-l-[3px] border-t-[3px] border-ink bg-ink"
      />

      <div className={cn("relative", illustrationAccents[tone])}>
        <Illustration />
      </div>

      <span className="label-brutal border-[3px] border-ink bg-paper px-3 py-1.5 text-ink">
        {eyebrow}
      </span>

      <h3 className="max-w-[18ch] font-display text-h3 uppercase text-ink">
        {renderHeading(title, "ink")}
      </h3>

      {description ? (
        <p className="max-w-md text-sm font-medium leading-relaxed text-ink-soft sm:text-base">
          {description}
        </p>
      ) : null}

      {icon ? <div aria-hidden="true">{icon}</div> : null}

      {action ? <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
