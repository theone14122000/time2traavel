import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  items?: React.ReactNode[];
  className?: string;
  tone?: "ink" | "lemon" | "coral";
  reverse?: boolean;
  slow?: boolean;
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

/**
 * Full-width ticker strip. Pure CSS animation, duplicated content for a
 * seamless loop, paused for users who prefer reduced motion.
 */
export function Marquee({
  items = DEFAULT_ITEMS,
  className,
  tone = "ink",
  reverse = false,
  slow = false,
  separator,
}: MarqueeProps) {
  const toneClasses =
    tone === "lemon"
      ? "bg-lemon text-ink"
      : tone === "coral"
        ? "bg-coral text-ink"
        : "bg-ink text-cream";

  const sep = separator ?? (
    <Sparkles aria-hidden="true" className="size-4 shrink-0" />
  );

  const renderGroup = (groupKey: string) => (
    <div
      key={groupKey}
      aria-hidden={groupKey === "duplicate" ? "true" : undefined}
      className="flex shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8"
    >
      {items.map((item, index) => (
        <span key={`${groupKey}-${index}`} className="flex items-center gap-6 sm:gap-8">
          <span className="label-brutal whitespace-nowrap text-xs sm:text-xs">
            {item}
          </span>
          {sep}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "marquee-pause relative w-full overflow-hidden border-y border-line py-3",
        toneClasses,
        className,
      )}
    >
      <div
        className={cn(
          "marquee-track flex w-max items-center motion-reduce:animate-none",
          slow ? "animate-marquee-slow" : "animate-marquee",
          reverse && "animate-marquee-reverse",
        )}
      >
        {renderGroup("original")}
        {renderGroup("duplicate")}
      </div>
    </div>
  );
}
