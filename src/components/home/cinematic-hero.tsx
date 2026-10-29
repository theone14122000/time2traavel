"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, MapPin, Pause, Play, Search } from "lucide-react";
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

/** Time each photograph stays on screen. */
const SLIDE_MS = 6500;
/** Reduced-motion visitors still get the reel (opacity only, no pans), just slower, with a pause control. */
const SLIDE_MS_REDUCED = 8500;
/** Ken Burns pans — alternate per slide so the motion never feels repetitive. */
const PANS = [
  "hero-pan-a",
  "hero-pan-b",
  "hero-pan-c",
  "hero-pan-b",
  "hero-pan-a",
] as const;

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
      <h2 className="mt-3 font-display text-2xl leading-tight">
        Where would you like to <GradientWord tone="onDark">go</GradientWord>?
      </h2>

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
 * Full-bleed cinematic hero with an auto-advancing photo reel.
 *
 * - Crossfades every few seconds with a slow Ken Burns pan on the active frame.
 * - Story-style progress bars show the time left; tap one to jump.
 * - Pauses on hover/focus and when the tab is hidden. A manual pick restarts
 *   the timer. A visible play/pause control is always present (WCAG 2.2.2).
 *   Swipe left/right on touch screens.
 * - Fully static under prefers-reduced-motion.
 */
export function CinematicHero({ slides, counts }: CinematicHeroProps) {
  const reduceMotion = useReducedMotion();
  const { openPlanner } = useTripPlanner();
  const [active, setActive] = React.useState(0);
  const [userPaused, setUserPaused] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);

  const count = slides.length;
  const autoplay = count > 1 && !userPaused && !hovering && !tabHidden;
  const slideMs = reduceMotion ? SLIDE_MS_REDUCED : SLIDE_MS;

  React.useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Restarts whenever the active slide changes, so manual picks get a full interval.
  React.useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % count), slideMs);
    return () => window.clearTimeout(id);
  }, [autoplay, active, count, slideMs]);

  const go = React.useCallback((index: number) => setActive(((index % count) + count) % count), [count]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  const stats = [
    counts && counts.destinations > 0 ? { value: counts.destinations, label: "Destinations" } : null,
    counts && counts.packages > 0 ? { value: counts.packages, label: "Curated packages" } : null,
  ].filter(Boolean) as { value: number; label: string }[];

  const current = slides[active];

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      className="relative isolate flex min-h-[min(86svh,44rem)] w-full items-end overflow-hidden bg-ink text-white lg:min-h-[min(92svh,52rem)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        const end = e.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) > 60) go(active + (delta < 0 ? 1 : -1));
      }}
    >
      {/* Photography */}
      <div className="absolute inset-0 -z-20 bg-ink" aria-hidden={count === 0}>
        {slides.map((slide, index) => {
          const isActive = index === active;
          // Render the active and the next frame eagerly so the crossfade never shows a gap.
          const eager = index === 0 || index === (active + 1) % count || isActive;
          return (
            <div
              key={slide.src}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
                isActive ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!isActive}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${slide.label}`}
            >
              <Image
                src={slide.src}
                alt={isActive ? slide.alt : ""}
                fill
                priority={index === 0}
                loading={eager ? "eager" : "lazy"}
                sizes="100vw"
                className={cn(
                  "object-cover will-change-transform",
                  isActive && !reduceMotion && PANS[index % PANS.length],
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Readability overlays */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

      <div className="lux-container pb-10 pt-28 sm:pb-14 lg:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p {...rise(0.05)} className="lux-eyebrow text-[#e6cf9f]">
              Travel beyond the ordinary
            </motion.p>

            <motion.h1 id="hero-heading" {...rise(0.15)} className="mt-5 font-display text-hero text-white">
              Your next <GradientWord tone="onDark">extraordinary</GradientWord> journey begins here.
            </motion.h1>

            <motion.p {...rise(0.3)} className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Discover remarkable destinations, unforgettable adventures, and journeys thoughtfully tailored to
              the way you want to travel.
            </motion.p>

            <motion.div {...rise(0.42)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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

        {/* Reel controls: label, counter, progress bars, play/pause */}
        <motion.div {...rise(0.6)} className="mt-10 border-t border-white/20 pt-5 sm:mt-14">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            {stats.length > 0 ? (
              <dl className="flex gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">{stat.label}</dt>
                    <dd className="font-display text-3xl text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <span />
            )}

            {current ? (
              <div className="flex min-w-0 flex-1 items-center justify-end gap-4 sm:flex-none">
                <p aria-live="polite" className="flex items-center gap-2 text-sm text-white/90">
                  <MapPin aria-hidden="true" className="size-4 shrink-0 text-[#e6cf9f]" />
                  <span key={current.label} className="hero-label">
                    {current.label}
                  </span>
                  <span className="tabular-nums text-white/55">
                    {String(active + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
                  </span>
                </p>
                {count > 1 ? (
                  <button
                    type="button"
                    onClick={() => setUserPaused((p) => !p)}
                    aria-label={userPaused ? "Play photo reel" : "Pause photo reel"}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-white/35 text-white/90 transition-colors hover:border-white hover:bg-white/10"
                  >
                    {userPaused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {count > 1 ? (
            <div role="group" aria-label="Choose photograph" className="mt-4 flex gap-2">
              {slides.map((slide, index) => {
                const isActive = index === active;
                const done = index < active;
                return (
                  <button
                    key={slide.src}
                    type="button"
                    aria-label={`Show ${slide.label}`}
                    aria-current={isActive}
                    onClick={() => go(index)}
                    className="group relative h-6 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover:h-1">
                      <span
                        key={isActive ? `fill-${active}-${autoplay}` : "idle"}
                        className={cn(
                          "absolute inset-y-0 left-0 block rounded-full bg-[#e6cf9f]",
                          done && "w-full",
                          isActive && (!autoplay || reduceMotion) && "w-full",
                          isActive && autoplay && !reduceMotion && "hero-progress",
                        )}
                        style={isActive && autoplay && !reduceMotion ? { animationDuration: `${slideMs}ms` } : undefined}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
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
