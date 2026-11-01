import * as React from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  items?: React.ReactNode[];
  className?: string;
  tone?: "ink" | "lemon" | "coral";
  reverse?: boolean;
  /** Seconds for one full half-loop. Lower is faster. */
  duration?: number;
  /** Copies of the item list per half. Enough must be rendered to span the widest screen. */
  repeat?: number;
  separator?: React.ReactNode;
};

const DEFAULT_ITEMS = [
  "Destinations",
  "Packages",
  "Plan My Trip",
  "Enquire Now",
  "Travel Guides",
  "Kasumpti · Shimla",
];

/** A small four-point gold spark between items. */
function Spark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0 text-gold" fill="currentColor">
      <path d="M12 0c.8 6.4 2.6 8.7 12 12-9.4 3.3-11.2 5.6-12 12-.8-6.4-2.6-8.7-12-12C9.4 8.7 11.2 6.4 12 0Z" />
    </svg>
  );
}

/**
 * Single full-width ticker strip that scrolls continuously.
 *
 * The track holds two identical halves and is translated by exactly -50%, so
 * the loop is seamless. Each half repeats the item list `repeat` times so one
 * half is always wider than the viewport (a short list would otherwise leave a
 * gap at the end of the loop on wide screens). Pure CSS, GPU-composited; pauses
 * on hover/focus. Under "reduce animations" it keeps moving but slower (see the
 * reduced-motion block in globals.css) so the strip never looks broken.
 */
export function Marquee({
  items = DEFAULT_ITEMS,
  className,
  tone = "ink",
  reverse = false,
  duration = 46,
  repeat = 4,
  separator,
}: MarqueeProps) {
  const toneClasses =
    tone === "lemon"
      ? "bg-sand text-ink"
      : tone === "coral"
        ? "bg-gold/30 text-ink"
        : "bg-ink text-cream";

  const sep = separator ?? <Spark />;

  const renderHalf = (half: "a" | "b") => (
    <div
      key={half}
      aria-hidden={half === "b" ? "true" : undefined}
      className="flex shrink-0 items-center"
    >
      {Array.from({ length: repeat }).flatMap((_, copy) =>
        items.map((item, index) => (
          <span
            key={`${half}-${copy}-${index}`}
            // Only the very first copy is announced; the rest exist to fill the width.
            aria-hidden={half === "b" || copy > 0 ? "true" : undefined}
            className="flex items-center gap-7 pr-7 sm:gap-10 sm:pr-10"
          >
            {typeof item === "string" ? (
              <span className="whitespace-nowrap font-display text-lg italic tracking-wide sm:text-xl">{item}</span>
            ) : (
              item
            )}
            {sep}
          </span>
        )),
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "marquee-pause relative w-full overflow-hidden border-y border-line py-3.5 sm:py-4",
        toneClasses,
        className,
      )}
    >
      <div
        className="marquee-track flex w-max items-center"
        style={{
          animation: `${reverse ? "marquee-scroll-reverse" : "marquee-scroll"} ${duration}s linear infinite`,
        }}
      >
        {renderHalf("a")}
        {renderHalf("b")}
      </div>
    </div>
  );
}
