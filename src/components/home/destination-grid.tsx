"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DestinationCard } from "@/components/shared/cards";
import { EmptyState } from "@/components/shared/empty-state";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/ui/badge";
import { REGION_FILTERS } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import { cn, pluralize } from "@/lib/utils";
import type { DestinationCard as DestinationData } from "@/lib/data/destinations";

/**
 * Filterable destination grid — desktop bento (first card spans two columns),
 * mobile snap rail. Chips are pure taxonomy (region/state labels); listings
 * themselves only ever come from the database.
 */
export function DestinationGrid({
  destinations,
  showViewAll = false,
  emptyStateTone = "butter",
}: {
  destinations: DestinationData[];
  showViewAll?: boolean;
  emptyStateTone?: "butter" | "mint" | "sky" | "peach" | "lavender" | "cream" | "paper";
}) {
  const [active, setActive] = React.useState<string>("All");
  const [enquiry, setEnquiry] = React.useState<DestinationData | null>(null);
  const reduceMotion = useReducedMotion();

  const dbValues = React.useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.state) set.add(d.state);
      if (d.region) set.add(d.region);
    });
    return set;
  }, [destinations]);

  const chips = React.useMemo(() => {
    const set = new Set<string>(REGION_FILTERS);
    dbValues.forEach((value) => set.add(value));
    return Array.from(set);
  }, [dbValues]);

  const filtered =
    active === "All"
      ? destinations
      : destinations.filter((d) => d.state === active || d.region === active);

  if (destinations.length === 0) {
    return (
      <EmptyState
        eyebrow="Destinations"
        title="Destinations coming soon"
        description="We're adding destinations to the site. In the meantime, tell us where you'd like to go and we'll plan it with you."
        tone={emptyStateTone}
        illustration="map"
        action={
          <Button asChild variant="secondary" size="md">
            <Link href="/about-us#contact">Enquire now</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="group"
          aria-label="Filter destinations by region"
        >
          {chips.map((chip) => (
            <TagChip key={chip} active={active === chip} onClick={() => setActive(chip)}>
              {chip}
            </TagChip>
          ))}
        </div>

        <p
          role="status"
          aria-live="polite"
          className="label-brutal shrink-0 text-ink-soft"
        >
          Showing {filtered.length} {pluralize(filtered.length, "destination")}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          eyebrow={`Filter · ${active}`}
          title={`No destinations under ${active} yet`}
          description="Nothing is published for this filter right now — pick another region or view everything."
          tone="sky"
          illustration="search"
          action={
            <Button type="button" variant="outline" onClick={() => setActive("All")}>
              Show all destinations
            </Button>
          }
        />
      ) : (
        <div className="no-scrollbar snap-rail -mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
          <AnimatePresence initial={false}>
            {filtered.map((destination, index) => (
              <motion.div
                key={destination.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                  "w-[78vw] max-w-sm shrink-0 sm:w-[42vw] lg:w-auto lg:max-w-none",
                  index === 0 && "lg:col-span-2",
                )}
              >
                <DestinationCard
                  destination={destination}
                  onEnquire={setEnquiry}
                  sizes={
                    index === 0
                      ? "(max-width: 1024px) 78vw, 60vw"
                      : "(max-width: 1024px) 42vw, 30vw"
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showViewAll && destinations.length > 0 ? (
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" size="md">
            <Link href="/destinations">
              View all destinations
              <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
      ) : null}

      <EnquiryDialog
        target={
          enquiry
            ? { kind: "destination", slug: enquiry.slug, name: enquiry.name }
            : null
        }
        open={Boolean(enquiry)}
        onOpenChange={(o) => {
          if (!o) setEnquiry(null);
        }}
      />
    </>
  );
}
