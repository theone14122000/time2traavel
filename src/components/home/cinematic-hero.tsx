"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GradientWord } from "@/components/ui/gradient-word";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type CinematicSlide = { src: string; alt: string; label: string };

type CinematicHeroProps = {
  slides: readonly CinematicSlide[];
  /** Real database counts only — a stat is hidden when it is zero. */
  counts?: { destinations: number; packages: number };
};

const SLIDE_MS = 6500;

/** Suggestions only — the planner accepts any destination text. */
const QUICK_DESTINATIONS = ["Himachal Pradesh", "Ladakh", "Kashmir", "Uttarakhand", "Bali", "Dubai"];

/** Glass quick-start card: hands its answers to the same planner every CTA opens. */
function HeroQuickPlan() {
  const { openPlanner } = useTripPlanner();
  const [destination, setDestination] = React.useState("");
  const [date, setDate] = React.useState("");
  const today = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <form
      aria-label="Quick trip planner"
      onSubmit={(event) => {
        event.preventDefault();
        openPlanner({
          destination: destination.trim() || undefined,
          travelDate: date || undefined,
        });
      }}
      className="glass hidden w-full max-w-sm rounded-3xl p-6 text-white lg:block"
    >
      <p className="lux-eyebrow text-[#e6cf9f]">Start planning</p>
      <h2 className="mt-3 font-display text-2xl leading-tight">Where would you like to go?</h2>

      <label className="mt-5 block text-xs font-medium uppercase tracking-[0.12em] text-white/75" htmlFor="hero-dest">
        Destination
      </label>
      <div className="relative mt-1.5">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/70" />
        <input
          id="hero-dest"
          list="hero-destinations"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Ladakh, Bali, Kashmir…"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-white/25 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/55 focus:border-white/70 focus:outline-none"
        />
        <datalist id="hero-destinations">
          {QUICK_DESTINATIONS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>

      <label className="mt-4 block text-xs font-medium uppercase tracking-[0.12em] text-white/75" htmlFor="hero-date">
        Travelling from
      </label>
      <input
        id="hero-date"
        type="date"
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-1.5 h-12 w-full rounded-xl border border-white/25 bg-white/10 px-3 text-sm text-white [color-scheme:dark] focus:border-white/70 focus:outline-none"
      />

      <button
        type="submit"
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-sm font-semibold text-ink transition-all hover:brightness-105 active:scale-[0.99]"
      >
        Plan this trip
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}

/**
 * Full-bleed cinematic hero. One photograph at a time crossfades behind an
 * editorial headline; the navy overlay keeps text legible at every crop.
 * Rotation is disabled under prefers-reduced-motion.
 */
export function CinematicHero({ slides, counts }: CinematicHeroProps) {
  const reduceMotion = useReducedMotion();
  const { openPlanner } = useTripPlanner();
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, slides.length]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  const stats = [
    counts && counts.destinations > 0
      ? { value: counts.destinations, label: "Destinations" }
      : null,
    counts && counts.packages > 0
      ? { value: counts.packages, label: "Curated packages" }
      : null,
  ].filter(Boolean) as { value: number; label: string }[];

  const current = slides[active];

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[min(86svh,44rem)] w-full items-end overflow-hidden bg-ink text-white lg:min-h-[min(92svh,52rem)]"
    >
      {/* Photography */}
      <div className="absolute inset-0 -z-20" aria-hidden={slides.length === 0}>
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={index === active ? slide.alt : ""}
            fill
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-[1400ms] ease-out",
              index === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      {/* Readability overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/60 via-transparent to-transparent"
      />

      <div className="lux-container pb-10 pt-28 sm:pb-14 lg:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.p
            {...rise(0.05)}
            className="lux-eyebrow text-[#e6cf9f]"
          >
            Travel beyond the ordinary
          </motion.p>

          <motion.h1
            id="hero-heading"
            {...rise(0.15)}
            className="mt-5 font-display text-hero text-white"
          >
            Your next <GradientWord tone="onDark">extraordinary</GradientWord> journey begins here.
          </motion.h1>

          <motion.p
            {...rise(0.3)}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
          >
            Discover remarkable destinations, unforgettable adventures, and journeys
            thoughtfully tailored to the way you want to travel.
          </motion.p>

          <motion.div
            {...rise(0.42)}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/destinations"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-ink transition-colors hover:bg-cream"
            >
              Explore Destinations
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <button
              type="button"
              onClick={() => openPlanner()}
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/50 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white/15"
            >
              Plan Your Journey
            </button>
          </motion.div>
        </div>

        <motion.div {...rise(0.5)} className="lg:col-span-4 lg:col-start-9">
          <HeroQuickPlan />
        </motion.div>
        </div>

        {/* Supporting strip */}
        <motion.div
          {...rise(0.6)}
          className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/20 pt-5 sm:mt-14"
        >
          {stats.length > 0 ? (
            <dl className="flex gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-3xl text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <span />
          )}

          {current ? (
            <p
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-white/85"
            >
              <MapPin aria-hidden="true" className="size-4 text-[#e6cf9f]" />
              {current.label}
              {slides.length > 1 ? (
                <span className="ml-2 flex gap-1.5" role="group" aria-label="Choose photograph">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.src}
                      type="button"
                      aria-label={`Show ${slide.label}`}
                      aria-current={index === active}
                      onClick={() => setActive(index)}
                      className="grid size-6 place-items-center"
                    >
                      <span
                        className={cn(
                          "h-0.5 rounded-full transition-all duration-500",
                          index === active ? "w-6 bg-[#e6cf9f]" : "w-3 bg-white/40",
                        )}
                      />
                    </button>
                  ))}
                </span>
              ) : null}
            </p>
          ) : null}
        </motion.div>
      </div>

      <a
        href="#domestic-destinations"
        aria-label="Scroll to destinations"
        className="scroll-cue absolute bottom-3 left-1/2 hidden -translate-x-1/2 text-white/80 hover:text-white sm:block"
      >
        <ChevronDown aria-hidden="true" className="size-6" />
      </a>
    </section>
  );
}
