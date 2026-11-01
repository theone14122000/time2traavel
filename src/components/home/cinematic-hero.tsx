"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Moon, Pause, Play, Search, Sun, Sunrise } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { GradientWord } from "@/components/ui/gradient-word";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DayCycleSlide, DayPhase } from "@/lib/hero-slides";

type CinematicHeroProps = {
  /** The day-cycle frames, in display order (sunrise → midday → night). */
  slides: readonly DayCycleSlide[];
  /** Real database counts only — a stat is hidden when it is zero. */
  counts?: { destinations: number; packages: number };
};

/** How long each time of day holds before the next dissolve begins. */
const HOLD_MS = 3600;
const HOLD_MS_REDUCED = 5200;
/** Matches --hero-dissolve in globals.css (the cross-dissolve + colour grade). */
const DISSOLVE_MS = 2200;

const PHASE_ICON: Record<DayPhase, typeof Sun> = { sunrise: Sunrise, midday: Sun, night: Moon };

/** The tint that sweeps the sky while we dissolve *into* a phase. */
const TINT_INTO: Record<DayPhase, "warm" | "dusk" | "dawn"> = {
  midday: "warm", // morning gold clearing to full daylight
  night: "dusk", // sunset: orange → magenta → indigo
  sunrise: "dawn", // pre-dawn violet → rose → gold
};

/** Same ridge in every frame, so one shared focal point keeps the dissolve seamless. */
const FOCAL = "42% 42%";

/** Deterministic pseudo-random so server and client render the same stars. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const STARS = (() => {
  const rnd = seeded(20260214);
  return Array.from({ length: 46 }, () => ({
    left: `${(rnd() * 100).toFixed(2)}%`,
    top: `${(rnd() * 100).toFixed(2)}%`,
    size: 1 + rnd() * 1.8,
    delay: `${(rnd() * 6).toFixed(2)}s`,
    duration: `${(2.6 + rnd() * 3.4).toFixed(2)}s`,
  }));
})();

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
 * Cinematic hero: one Himalayan ridge through a full day.
 *
 * Sunrise → midday → (a synthesised sunset glow) → night → (pre-dawn glow) →
 * sunrise. Frames dissolve over ~2.2s while a colour-grade wash sweeps the sky,
 * so the changeover feels like light moving, not a slideshow cut. At night the
 * sky gains twinkling stars and the odd shooting star; mist drifts across the
 * valley in every phase.
 *
 * Hover/focus and a hidden tab pause the cycle; a play/pause control is always
 * present (WCAG 2.2.2). Swipe on touch screens. Reduced-motion visitors keep the
 * dissolve (opacity only) but lose pans, twinkling and meteors.
 */
export function CinematicHero({ slides, counts }: CinematicHeroProps) {
  const reduceMotion = useReducedMotion();
  const { openPlanner } = useTripPlanner();
  const [active, setActive] = React.useState(0);
  const [transition, setTransition] = React.useState<{ id: number; into: DayPhase; from: number } | null>(null);
  const [userPaused, setUserPaused] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);
  const transitionId = React.useRef(0);

  const count = slides.length;
  const autoplay = count > 1 && !userPaused && !hovering && !tabHidden;
  const holdMs = reduceMotion ? HOLD_MS_REDUCED : HOLD_MS;
  const phase: DayPhase = slides[active]?.phase ?? "midday";

  React.useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const go = React.useCallback(
    (index: number) => {
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      if (next === active) return;
      const into = slides[next]?.phase ?? "midday";
      transitionId.current += 1;
      setTransition({ id: transitionId.current, into, from: active });
      setActive(next);
    },
    [active, count, slides],
  );

  // Restarts on every change, so a manual pick gets a full hold before the next dissolve.
  React.useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => go(active + 1), holdMs);
    return () => window.clearTimeout(id);
  }, [autoplay, active, go, holdMs]);

  // Clears the colour wash once its animation has finished.
  React.useEffect(() => {
    if (!transition) return;
    const id = window.setTimeout(() => setTransition(null), DISSOLVE_MS + 200);
    return () => window.clearTimeout(id);
  }, [transition]);

  // Always animates to fully visible. Reduced-motion visitors (known only after mount,
  // to keep hydration consistent) just get an instant, non-moving transition.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion ? { duration: 0.01 } : { duration: 0.8, delay, ease: EASE },
  });

  const stats = [
    counts && counts.destinations > 0 ? { value: counts.destinations, label: "Destinations" } : null,
    counts && counts.packages > 0 ? { value: counts.packages, label: "Curated packages" } : null,
  ].filter(Boolean) as { value: number; label: string }[];

  const current = slides[active];
  const isNight = phase === "night";

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      data-phase={phase}
      className="hero-cycle relative isolate flex min-h-[min(88svh,46rem)] w-full items-end overflow-hidden bg-ink text-white lg:min-h-[min(92svh,52rem)]"
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
      {/* Photography: three frames of one place, dissolving through the day */}
      <div className="absolute inset-0 -z-20 bg-ink">
        {slides.map((slide, index) => {
          const isActive = index === active;
          const isOutgoing = transition?.from === index && !isActive;
          return (
            <div
              key={slide.phase}
              // The incoming frame fades in on top while the outgoing one stays fully
              // opaque beneath it, so the cross-dissolve never dips through black.
              className={cn(
                "absolute inset-0",
                isActive && "hero-frame-in z-[2] opacity-100",
                isOutgoing && "z-[1] opacity-100",
                !isActive && !isOutgoing && "z-0 opacity-0",
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
                loading="eager"
                // The first frame is the LCP image; the others load right behind it.
                fetchPriority={index === 0 ? "high" : "low"}
                sizes="100vw"
                style={{ objectPosition: FOCAL }}
                className={cn(
                  "object-cover will-change-transform",
                  isActive && !reduceMotion && "hero-drift",
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Sky effects, each tied to the current phase */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[15] overflow-hidden">
        {/* Colour wash that sweeps the sky while the frames dissolve */}
        {transition ? <div key={transition.id} className={`hero-tint hero-tint-${TINT_INTO[transition.into]}`} /> : null}

        {/* Warm bloom while the sun is up near the horizon */}
        <div className={cn("hero-bloom", phase === "sunrise" && "hero-bloom-on")} />

        {/* Stars + meteor: only in the night phase */}
        <div className={cn("hero-stars", isNight && "hero-stars-on")}>
          {STARS.map((star, i) => (
            <span
              key={i}
              className={cn("hero-star", reduceMotion && "hero-star-still")}
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
          {!reduceMotion ? <span className="hero-meteor" /> : null}
        </div>

        {/* Valley mist drifting across the lower slopes */}
        {!reduceMotion ? (
          <>
            <div className="hero-mist hero-mist-a" />
            <div className="hero-mist hero-mist-b" />
          </>
        ) : null}
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

        {/* Time-of-day selector: sunrise · midday · night */}
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

            {count > 1 ? (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Play the day cycle" : "Pause the day cycle"}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/35 text-white/90 transition-colors hover:border-white hover:bg-white/10"
              >
                {userPaused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
              </button>
            ) : null}
          </div>

          {count > 1 ? (
            <div role="group" aria-label="Choose time of day" className="mt-4 flex gap-2 sm:gap-3">
              {slides.map((slide, index) => {
                const isActive = index === active;
                const done = index < active;
                const Icon = PHASE_ICON[slide.phase];
                return (
                  <button
                    key={slide.phase}
                    type="button"
                    aria-label={`Show ${slide.label}`}
                    aria-current={isActive}
                    onClick={() => go(index)}
                    className="group flex-1 text-left"
                  >
                    <span
                      className={cn(
                        "mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-500",
                        isActive ? "text-[#f1dcae]" : "text-white/55 group-hover:text-white/85",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      <span className="hidden sm:inline">{slide.label}</span>
                    </span>
                    <span className="relative block h-6">
                      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover:h-1">
                        <span
                          key={isActive ? `fill-${active}-${autoplay}` : "idle"}
                          className={cn(
                            "absolute inset-y-0 left-0 block rounded-full bg-[#e6cf9f]",
                            done && "w-full",
                            isActive && (!autoplay || reduceMotion) && "w-full",
                            isActive && autoplay && !reduceMotion && "hero-progress",
                          )}
                          style={isActive && autoplay && !reduceMotion ? { animationDuration: `${holdMs}ms` } : undefined}
                        />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {current ? (
            <p aria-live="polite" className="sr-only">
              {current.label}
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
