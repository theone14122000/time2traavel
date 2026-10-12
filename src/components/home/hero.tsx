"use client";

import * as React from "react";
import { ArrowRight, CalendarDays, Compass, MapPin, Users } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Container } from "@/components/shared/container";
import { CountUp } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrutalImage } from "@/components/ui/brutal-image";
import {
  AnimatedHeading,
  WordSwapper,
} from "@/components/ui/animated-heading";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import { REGION_FILTERS, TRIP_TYPES, TRAVELLER_COUNTS } from "@/lib/constants";
import { fadeUp, stagger } from "@/lib/motion";

export type HeroTile = { src: string | null; alt: string };

type HeroProps = {
  title: string;
  subtitle: string;
  instruction: string;
  /** Real database counts only (never invented). */
  counts?: { destinations: number; packages: number };
  /** Destination images from the database — empty list renders the collage. */
  tiles?: HeroTile[];
  founderName?: string | null;
};

/** Structural swapper words — the site's own destination-region taxonomy. */
const SWAPPER_WORDS = REGION_FILTERS.filter(
  (region) => region !== "All",
);

/* ------------------------------------------------------------------ *
 * Decorative postcard/ticket/stamp collage — flat shapes only,        *
 * aria-hidden, contained inside the bordered frame.                    *
 * ------------------------------------------------------------------ */
function CollageShapes({
  parallax,
}: {
  parallax?: {
    a: MotionValue<number>;
    b: MotionValue<number>;
    c: MotionValue<number>;
  };
}) {
  return (
    <div aria-hidden="true" className="flex h-full items-center justify-center gap-3 px-4">
      {/* Postcard — percentage widths keep min-content at zero */}
      <motion.figure
        style={{
          rotate: "-4deg",
          y: parallax?.a,
        }}
        className="relative aspect-[4/3] w-[44%] max-h-full shrink border-[3px] border-ink bg-paper shadow-hard-sm"
      >
        <span className="absolute inset-1.5 border-2 border-dashed border-ink/30" />
        <span className="absolute left-3 top-3 h-2 w-2/3 bg-sky" />
        <span className="absolute left-3 top-7 h-2 w-1/2 bg-mint" />
        <span className="absolute bottom-3 right-3 size-8 rounded-full border-[3px] border-ink bg-blush" />
      </motion.figure>

      {/* Ticket */}
      <motion.figure
        style={{ rotate: "3deg", y: parallax?.b }}
        className="relative aspect-[3/4] w-[28%] max-h-full shrink border-[3px] border-ink bg-lemon shadow-hard-sm"
      >
        <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-ink/50" />
        <span className="absolute left-2 top-2 size-4 border-2 border-ink bg-paper" />
        <span className="absolute bottom-2 left-2 h-2 w-10 bg-tomato" />
        <span className="absolute bottom-6 left-2 h-2 w-6 bg-ink" />
      </motion.figure>

      {/* Stamp */}
      <motion.figure
        style={{ rotate: "-8deg", y: parallax?.c }}
        className="relative aspect-square w-[24%] max-h-full shrink border-[3px] border-dashed border-ink bg-lavender shadow-hard-sm"
      >
        <span className="absolute inset-1.5 border-2 border-ink bg-peach" />
        <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-mint" />
      </motion.figure>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hero visual — swipeable image carousel when admin images exist,     *
 * compact decorative collage otherwise. Framed, never cropped oddly.   *
 * ------------------------------------------------------------------ */
function HeroVisual({
  tiles,
  parallax,
}: {
  tiles: HeroTile[];
  parallax?: {
    a: MotionValue<number>;
    b: MotionValue<number>;
    c: MotionValue<number>;
  };
}) {
  const hasTiles = tiles.length > 0;

  if (hasTiles) {
    return (
      <div className="snap-rail no-scrollbar flex h-full items-center gap-3 overflow-x-auto p-3">
        {tiles.map((tile, index) => (
          <figure
            key={`hero-tile-${index}`}
            className="aspect-[4/3] h-full shrink-0 snap-center"
          >
            <BrutalImage
              src={tile.src}
              alt={tile.alt}
              decorative={!tile.alt}
              aspect="free"
              priority={index === 0}
              sizes="(max-width: 768px) 85vw, 34vw"
              className="h-full w-full shadow-hard-sm"
            />
          </figure>
        ))}
      </div>
    );
  }

  return <CollageShapes parallax={parallax} />;
}

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
  const [tripType, setTripType] = React.useState("");

  const hasCounts = Boolean(
    counts && (counts.destinations > 0 || counts.packages > 0),
  );
  const visibleTiles: HeroTile[] = tiles.slice(0, 3);
  const animate = !reduceMotion;

  /* Desktop parallax — subtle scroll-linked shift on the collage only. */
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const py1 = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -26]);
  const py2 = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 16]);
  const py3 = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -12]);
  const parallax = React.useMemo(
    () => ({ a: py1, b: py2, c: py3 }),
    [py1, py2, py3],
  );

  function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openPlanner({ destination, travelDate, travellers, tripType });
  }

  function handleQuickPlan() {
    openPlanner({ destination, travelDate, travellers, tripType });
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden border-b-[3px] border-ink bg-sunrise clip-x md:min-h-svh"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0" />
      <span
        aria-hidden="true"
        className="absolute -right-10 -top-10 size-44 rotate-12 border-[3px] border-ink bg-lemon sm:size-64"
      />

      {/* 24px side padding on mobile, then the standard fluid scale */}
      <Container className="relative px-6 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16 xl:px-14 xl:py-20">
        <motion.div
          initial={animate ? "hidden" : "show"}
          animate="show"
          variants={stagger(0.08)}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-12 lg:gap-10">
            {/* -------- Copy column: chip → headline → swapper → sub → CTAs -------- */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-1 lg:col-span-7"
            >
              <span className="label-brutal inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-2 shadow-hard-xs">
                <MapPin aria-hidden="true" className="size-3.5" />
                Kasumpti, Shimla · Himachal Pradesh
              </span>

              <AnimatedHeading
                as="h1"
                id="hero-heading"
                text={title}
                variant="hero"
                lines={3}
                scribble={0}
                sticker
                className="mt-5 max-w-[13ch] text-hero uppercase lg:text-hero-lg"
              />

              <WordSwapper
                words={SWAPPER_WORDS}
                prefix="Explore"
                tone="mint"
                className="mt-3"
              />

              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lead">
                {subtitle}
              </p>

              {/* CTA pair — stacked on phones, side by side once they fit */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleQuickPlan}
                  magnetic
                >
                  <Compass aria-hidden="true" className="size-5" />
                  Plan My Trip
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <a href="#destinations">
                    Browse destinations
                    <ArrowRight aria-hidden="true" className="size-5" />
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* -------- Visual column: framed collage + anchored sticker -------- */}
            <motion.aside
              variants={fadeUp}
              className="md:col-span-1 lg:col-span-5"
              aria-label="Time to Travel at a glance"
            >
              <div className="relative">
                {/* Rotated sticker — anchored to the frame corner, never over text */}
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-5 z-10 flex size-[76px] rotate-[10deg] items-center justify-center rounded-full border-[3px] border-ink bg-tomato text-center text-[10px] font-black uppercase leading-tight tracking-wide text-ink shadow-hard-xs sm:size-[84px] sm:text-[11px]"
                >
                  Shimla
                  <br />
                  based
                </span>

                <div className="h-[212px] overflow-hidden border-[3px] border-ink bg-paper shadow-brutal-md sm:h-[248px] lg:h-[340px] xl:h-[380px]">
                  <HeroVisual tiles={visibleTiles} parallax={parallax} />
                </div>
              </div>

              {hasCounts ? (
                <div className="mt-6 hidden border-4 border-ink bg-paper p-5 shadow-brutal-md sm:block">
                  <p className="label-brutal text-ink-soft">
                    Live from our catalogue
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border-[3px] border-ink bg-mint p-4 shadow-hard-xs">
                      <dt className="label-brutal text-ink-soft">
                        Destinations
                      </dt>
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
                      <span aria-hidden="true">→</span> Office in Kasumpti,
                      Shimla, Himachal Pradesh
                    </li>
                    {founderName ? (
                      <li className="flex items-center gap-2 border-[3px] border-ink bg-sunrise px-3 py-2">
                        <span aria-hidden="true">→</span> Founded by{" "}
                        {founderName}
                      </li>
                    ) : null}
                    <li className="flex items-center gap-2 border-[3px] border-ink bg-sunrise px-3 py-2">
                      <span aria-hidden="true">→</span> Destinations, packages
                      &amp; FAQs managed by our team
                    </li>
                  </ul>
                </div>
              ) : null}
            </motion.aside>

            {/* -------- Boarding-pass enquiry panel: full-width, in-flow -------- */}
            <motion.form
              variants={fadeUp}
              onSubmit={handleStart}
              className="border-4 border-ink bg-paper p-4 shadow-brutal-md sm:p-5 md:col-span-2 lg:col-span-12"
              aria-label="Quick trip enquiry"
            >
              <p className="label-brutal mb-4 text-ink-soft">{instruction}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Destination — full row */}
                <label className="grid min-w-0 gap-1.5 sm:col-span-2">
                  <span className="label-brutal flex items-center gap-1.5">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    Destination
                  </span>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where to?"
                    autoComplete="off"
                    enterKeyHint="next"
                    name="quick-destination"
                    className="min-w-0"
                  />
                </label>

                {/* Date + Travellers — two columns */}
                <label className="grid min-w-0 gap-1.5">
                  <span className="label-brutal flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    Travel date
                  </span>
                  <Input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    name="quick-date"
                    className="min-w-0"
                  />
                </label>

                <label className="grid min-w-0 gap-1.5">
                  <span className="label-brutal flex items-center gap-1.5">
                    <Users aria-hidden="true" className="size-3.5" />
                    Travellers
                  </span>
                  <select
                    value={travellers}
                    onChange={(e) => setTravellers(e.target.value)}
                    name="quick-travellers"
                    className="h-12 w-full min-w-0 appearance-none rounded-chip border-[3px] border-ink bg-paper px-3.5 py-2 text-base font-medium shadow-hard-xs focus:outline-none focus-visible:shadow-[4px_4px_0_var(--color-ink)]"
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

                {/* Trip type — full row */}
                <label className="grid min-w-0 gap-1.5 sm:col-span-2">
                  <span className="label-brutal flex items-center gap-1.5">
                    <Compass aria-hidden="true" className="size-3.5" />
                    Trip type
                  </span>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    name="quick-trip-type"
                    className="h-12 w-full min-w-0 appearance-none rounded-chip border-[3px] border-ink bg-paper px-3.5 py-2 text-base font-medium shadow-hard-xs focus:outline-none focus-visible:shadow-[4px_4px_0_var(--color-ink)]"
                  >
                    <option value="">Any</option>
                    {TRIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  magnetic
                >
                  <Compass aria-hidden="true" className="size-5" />
                  Plan My Trip
                </Button>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
