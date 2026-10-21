"use client";

import * as React from "react";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";
import { DomesticDestinationCard } from "@/components/destinations/domestic-destination-card";
import type { DomesticDestination } from "@/lib/domestic-destinations";

type Props = {
  destinations: readonly DomesticDestination[];
  className?: string;
};

export function DomesticDestinationsGrid({ destinations, className }: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-domestic-card]"));
    if (cards.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.index ?? 0);
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { idx, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActive(best.idx);
      },
      { root: container, threshold: [0.5, 0.75] },
    );
    cards.forEach((card) => obs.observe(card));
    return () => obs.disconnect();
  }, [destinations.length]);

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto pb-4 no-scrollbar",
          "md:overflow-visible md:pb-0",
        )}
      >
        <StaggerGroup
          className={cn(
            "flex snap-x snap-mandatory gap-4",
            "md:grid md:grid-cols-2 md:gap-6",
            "lg:grid-cols-4",
          )}
        >
          {destinations.map((destination, index) => (
            <StaggerItem
              key={destination.slug}
              className={cn(
                "shrink-0 snap-start",
                "w-[86vw] max-w-[360px]",
                "md:w-auto md:max-w-none",
              )}
            >
              <div data-domestic-card data-index={index}>
                <DomesticDestinationCard destination={destination} />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div className="mt-2 flex justify-center gap-2 md:hidden" aria-hidden="true">
        {destinations.map((d, i) => (
          <span
            key={d.slug}
            className={cn(
              "h-2 w-2 rounded-full border border-ink transition-colors",
              i === active ? "bg-ink" : "bg-paper",
            )}
          />
        ))}
      </div>
    </div>
  );
}
