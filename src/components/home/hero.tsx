"use client";

import * as React from "react";
import { ArrowRight, CalendarDays, Compass, MapPin, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { CountUp } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stamp } from "@/components/ui/badge";
import { BrutalImage } from "@/components/ui/brutal-image";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import { TRAVELLER_COUNTS } from "@/lib/constants";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { HighlightedTitle } from "@/components/home/highlight-title";

export type HeroTile = { src: string | null; alt: string };

type HeroProps = {
  title: string;
  subtitle: string;
  instruction: string;
  /** Real database counts only (never invented). */
  counts?: { destinations: number; packages: number };
  /** Destination images from the database — empty list renders SVG placeholders. */
  tiles?: HeroTile[];
  founderName?: string | null;
};

const TILE_ROTATIONS = [-4, 3, -2];

export function Hero({
  title,
  subtitle,
  instruction,
  counts,
  tiles = [],
  founderName,
}: HeroProps) {
  const { openPlanner } = useTripPlanner();
  const reduceMotion = useReducedMotion();

  const [destination, setDestination] = React.useState("");
  const [travelDate, setTravelDate] = React.useState("");
  const [travellers, setTravellers] = React.useState("");

  const hasCounts = Boolean(counts && (counts.destinations > 0 || counts.packages > 0));
  const hasTiles = tiles.length > 0;
  const visibleTiles: HeroTile[] = hasTiles
    ? tiles.slice(0, 3)
    : [
        { src: null, alt: "" },
        { src: null, alt: "" },
      ];

  function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openPlanner({ destination, travelDate, travellers });
  }

  const animate = !reduceMotion;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden border-b-[3px] border-ink bg-sunrise"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0" />
      <span
        aria-hidden="true"
        className="absolute -right-10 -top-10 size-48 rotate-12 border-[3px] border-ink bg-lemon sm:size-64"
      />

      <Container className="relative py-10 sm:py-14 lg:py-16">
        <motion.div
          initial={animate ? "hidden" : "show"}
          animate="show"
          variants={stagger(0.08)}
        >
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-10">
            {/* -------- Copy column -------- */}
            <motion.div variants={fadeUp} className="lg:col-span-7">
              <div className="relative">
                <span className="label-brutal inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-2 shadow-hard-xs">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  Kasumpti, Shimla · Himachal Pradesh
                </span>

                <Stamp
                  rotate={9}
                  variant="tomato"
                  className="absolute -top-3 right-0 hidden sm:inline-flex"
                >
                  Shimla-based
                </Stamp>
              </div>

              <h1
                id="hero-heading"
                className="mt-6 max-w-[14ch] font-display text-display uppercase"
              >
                <HighlightedTitle text={title} />
              </h1>

              <p className="mt-5 max-w-xl text-lead font-medium text-ink-soft">
                {subtitle}
              </p>
            </motion.div>

            {/* -------- Visual column: DB image tiles + live counts -------- */}
            <motion.aside
              variants={fadeUp}
              className="lg:col-span-5"
              aria-label="Time to Travel at a glance"
            >
              <div className="grid grid-cols-2 gap-4">
                {visibleTiles.map((tile, index) => (
                  <motion.figure
                    key={`hero-tile-${index}`}
                    style={{ rotate: `${TILE_ROTATIONS[index % TILE_ROTATIONS.length]}deg` }}
                    animate={animate ? { y: [0, index % 2 === 0 ? -8 : 8, 0] } : undefined}
                    transition={{
                      duration: 5 + index,
                      repeat: animate ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className={cn(
                      index === 0 || visibleTiles.length < 3 ? "col-span-2" : null,
                    )}
                  >
                    <BrutalImage
                      src={tile.src}
                      alt={tile.alt}
                      decorative={!tile.alt}
                      aspect={index === 0 ? "wide" : "square"}
                      priority={index === 0}
                      sizes="(max-width: 1024px) 92vw, 34vw"
                      className="shadow-brutal-lg"
                    />
                  </motion.figure>
                ))}
              </div>

              {hasCounts ? (
                <div className="mt-6 border-4 border-ink bg-paper p-5 shadow-brutal-md">
                  <p className="label-brutal text-ink-soft">Live from our catalogue</p>

                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border-[3px] border-ink bg-mint p-4 shadow-hard-xs">
                      <dt className="label-brutal text-ink-soft">Destinations</dt>
                      <dd className="mt-2 font-display text-4xl leading-none">
                        <CountUp value={counts?.destinations ?? 0} />
                      </dd>
                    </div>
                    <div className="border-[3px] border-ink bg-sky p-4 shadow-hard-xs">
                      <dt className="label-brutal text-ink-soft">Packages</dt>
                      <dd className="mt-2 font-display text-4xl leading-none">
                        <CountUp value={counts?.packages ?? 0} />
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-4 grid gap-2 text-sm font-semibold">
                    <li className="flex items-center gap-2 border-[3px] border-ink bg-sunrise px-3 py-2">
                      <span aria-hidden="true">→</span> Office in Kasumpti, Shimla,
                      Himachal Pradesh
                    </li>
                    {founderName ? (
                      <li className="flex items-center gap-2 border-[3px] border-ink bg-sunrise px-3 py-2">
                        <span aria-hidden="true">→</span> Founded by {founderName}
                      </li>
                    ) : null}
                    <li className="flex items-center gap-2 border-[3px] border-ink bg-sunrise px-3 py-2">
                      <span aria-hidden="true">→</span> Destinations, packages &amp; FAQs
                      managed by our team
                    </li>
                  </ul>
                </div>
              ) : null}
            </motion.aside>
          </div>

          {/* -------- Quick enquiry bar, docked at the bottom of the hero -------- */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleStart}
            className="mt-10 border-4 border-ink bg-paper p-4 shadow-brutal-md sm:p-5"
            aria-label="Quick trip enquiry"
          >
            <p className="label-brutal mb-4 text-ink-soft">{instruction}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5">
                <span className="label-brutal flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  Destination
                </span>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where to?"
                  autoComplete="off"
                  name="quick-destination"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="label-brutal flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  Travel date
                </span>
                <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  name="quick-date"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="label-brutal flex items-center gap-1.5">
                  <Users aria-hidden="true" className="size-3.5" />
                  Travellers
                </span>
                <select
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  name="quick-travellers"
                  className="h-12 w-full appearance-none rounded-chip border-[3px] border-ink bg-paper px-3.5 py-2 text-sm font-medium shadow-hard-xs focus:outline-none focus-visible:shadow-[4px_4px_0_var(--color-ink)]"
                >
                  <option value="">Any</option>
                  {TRAVELLER_COUNTS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                      {count === "8+"
                        ? " people"
                        : count === "1"
                          ? " traveller"
                          : " travellers"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                magnetic
              >
                <Compass aria-hidden="true" className="size-5" />
                Plan My Trip
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <a href="#destinations">
                  Browse destinations
                  <ArrowRight aria-hidden="true" className="size-5" />
                </a>
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </Container>
    </section>
  );
}
