"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Moon, Pause, Play, Search, Sun, Sunrise, Sunset } from "lucide-react";
import { motion } from "framer-motion";
import { GradientWord } from "@/components/ui/gradient-word";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DayCycleSlide } from "@/lib/hero-slides";

type CinematicHeroProps = {
  /** The day-cycle frames, in display order (sunrise → midday → night). */
  slides: readonly DayCycleSlide[];
  /** Real database counts only — a stat is hidden when it is zero. */
  counts?: { destinations: number; packages: number };
};

/** One full day (sunrise → midday → sunset → night → sunrise), in milliseconds. */
const DAY_MS = 24000;
const DAY_MS_REDUCED = 40000;

/** Where the quick-jump chips land on the 0–1 timeline. */
const JUMPS = [
  { label: "Sunrise", t: 0, Icon: Sunrise },
  { label: "Midday", t: 1 / 3, Icon: Sun },
  { label: "Sunset", t: 0.5, Icon: Sunset },
  { label: "Night", t: 2 / 3, Icon: Moon },
] as const;

/** Friendly name for a moment on the timeline. */
function momentName(t: number): { name: string; Icon: typeof Sun } {
  if (t < 0.05 || t >= 0.95) return { name: "Sunrise", Icon: Sunrise };
  if (t < 0.25) return { name: "Morning", Icon: Sun };
  if (t < 0.38) return { name: "Midday", Icon: Sun };
  if (t < 0.45) return { name: "Afternoon", Icon: Sun };
  if (t < 0.58) return { name: "Sunset", Icon: Sunset };
  if (t < 0.68) return { name: "Dusk", Icon: Sunset };
  if (t < 0.85) return { name: "Night", Icon: Moon };
  return { name: "Dawn", Icon: Sunrise };
}

const ease = (p: number) => (1 - Math.cos(Math.PI * p)) / 2;
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const bell = (p: number) => Math.sin(Math.PI * p);

/** Same ridge in every frame, so one shared focal point keeps the blend seamless. */
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
 * Cinematic hero: one Himalayan ridge through a whole day, in one continuous motion.
 *
 * A single 0→1 timeline drives everything, frame by frame, with no holds and no
 * cuts:
 *   0.00 sunrise ─ 0.33 midday ─ 0.50 sunset ─ 0.67 night ─ 1.00 sunrise again
 * Photos cross-blend with a cosine ease (the outgoing frame stays fully opaque
 * underneath, so there is never a dark dip). On top of them the sky is graded
 * continuously: a warm morning wash, a sinking sun and an orange→magenta→indigo
 * sunset, stars and a shooting star fading in at night, and a violet→rose→gold
 * dawn that hands back to the rising sun. Mist drifts through every phase.
 *
 * Values are written straight to the DOM from one requestAnimationFrame loop
 * (no React re-render per frame). The loop pauses while hovering/focusing, when
 * the tab is hidden or the hero is off-screen, and while the visitor drags the
 * time-of-day slider. A play/pause control is always present (WCAG 2.2.2).
 * Reduced-motion visitors get the same blend, only slower, with no pans,
 * twinkling or meteor.
 */
export function CinematicHero({ slides, counts }: CinematicHeroProps) {
  const reduceMotion = useReducedMotion();
  const { openPlanner } = useTripPlanner();

  const sectionRef = React.useRef<HTMLElement>(null);
  const frameRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const duskRef = React.useRef<HTMLDivElement>(null);
  const dawnRef = React.useRef<HTMLDivElement>(null);
  const warmRef = React.useRef<HTMLDivElement>(null);
  const bloomRef = React.useRef<HTMLDivElement>(null);
  const starsRef = React.useRef<HTMLDivElement>(null);
  const orbRef = React.useRef<HTMLDivElement>(null);
  const sliderRef = React.useRef<HTMLInputElement>(null);

  const tRef = React.useRef(0);
  const tweenRef = React.useRef<{ from: number; to: number; start: number; dur: number } | null>(null);
  const scrubbingRef = React.useRef(false);
  const resumeTimer = React.useRef<number | null>(null);
  const touchStart = React.useRef<number | null>(null);

  const [userPaused, setUserPaused] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [moment, setMoment] = React.useState(() => momentName(0));

  const count = slides.length;
  const playing = count > 1 && !userPaused && !hovering && !tabHidden && inView;
  const dayMs = reduceMotion ? DAY_MS_REDUCED : DAY_MS;
  const useThree = count === 3;

  /** Paints the whole sky for a moment `t` on the 0–1 timeline. */
  const apply = React.useCallback(
    (t: number) => {
      if (!useThree) return;
      const seg = Math.min(2, Math.floor(t * 3)); // 0 sunrise→midday · 1 midday→night · 2 night→sunrise
      const p = t * 3 - seg;
      const e = ease(p);
      const incoming = (seg + 1) % 3;

      frameRefs.current.forEach((el, i) => {
        if (!el) return;
        // Incoming frame fades in on top while the outgoing one stays opaque beneath.
        el.style.opacity = i === incoming ? String(e) : i === seg ? "1" : "0";
        el.style.zIndex = i === incoming ? "2" : i === seg ? "1" : "0";
      });

      const b = bell(p);
      if (warmRef.current) warmRef.current.style.opacity = String(seg === 0 ? 0.75 * b : 0);
      if (duskRef.current) duskRef.current.style.opacity = String(seg === 1 ? 0.95 * Math.pow(b, 1.1) : 0);
      if (dawnRef.current) dawnRef.current.style.opacity = String(seg === 2 ? 0.9 * Math.pow(b, 1.1) : 0);

      const night = seg === 1 ? smooth(0.5, 1, p) : seg === 2 ? 1 - smooth(0, 0.6, p) : 0;
      if (starsRef.current) starsRef.current.style.opacity = String(night);

      const sunUp = seg === 2 ? smooth(0.4, 1, p) : seg === 0 ? 1 - smooth(0, 0.6, p) : 0;
      if (bloomRef.current) bloomRef.current.style.opacity = String(sunUp);

      // The sun sinking toward the horizon during the midday → night blend.
      const orb = orbRef.current;
      if (orb) {
        if (seg === 1) {
          const y = 22 + 44 * ease(p); // % of hero height
          orb.style.opacity = String(Math.pow(b, 0.8) * 0.95);
          orb.style.top = `${y}%`;
          orb.style.transform = `translate(-50%, -50%) scale(${(1 + 0.35 * ease(p)).toFixed(3)})`;
        } else {
          orb.style.opacity = "0";
        }
      }

      const sec = sectionRef.current;
      if (sec) sec.dataset.phase = night > 0.5 ? "night" : sunUp > 0.5 ? "sunrise" : "midday";

      const next = momentName(t);
      setMoment((prev) => (prev.name === next.name ? prev : next));
      const slider = sliderRef.current;
      if (slider && !scrubbingRef.current) slider.value = String(Math.round(t * 1000));
    },
    [useThree],
  );

  // First paint (also re-applies after a hydration-time reduced-motion flip).
  React.useEffect(() => {
    apply(tRef.current);
  }, [apply]);

  React.useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The single animation loop.
  React.useEffect(() => {
    if (!useThree) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const tw = tweenRef.current;
      if (tw) {
        const k = Math.min(1, (now - tw.start) / tw.dur);
        tRef.current = (tw.from + (tw.to - tw.from) * ease(k)) % 1;
        if (k >= 1) tweenRef.current = null;
        apply(tRef.current);
      } else if (playing && !scrubbingRef.current) {
        tRef.current = (tRef.current + dt / dayMs) % 1;
        apply(tRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [apply, playing, dayMs, useThree]);

  /** Glides forward to a moment (never backwards, so the light always moves on). */
  const jumpTo = React.useCallback(
    (target: number) => {
      const from = tRef.current;
      const to = target > from ? target : target + 1;
      const dur = Math.max(1100, Math.min(3200, (to - from) * 6000));
      tweenRef.current = { from, to, start: performance.now(), dur };
    },
    [],
  );

  const onScrub = (value: number) => {
    scrubbingRef.current = true;
    tweenRef.current = null;
    tRef.current = Math.min(0.9999, Math.max(0, value / 1000));
    apply(tRef.current);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      scrubbingRef.current = false;
    }, 1800);
  };

  React.useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion ? { duration: 0.01 } : { duration: 0.8, delay, ease: EASE },
  });

  const stats = [
    counts && counts.destinations > 0 ? { value: counts.destinations, label: "Destinations" } : null,
    counts && counts.packages > 0 ? { value: counts.packages, label: "Curated packages" } : null,
  ].filter(Boolean) as { value: number; label: string }[];

  const MomentIcon = moment.Icon;
  // Initial z-order matches t = 0 (sunrise frame on screen, midday waiting on top).
  const initialZ = [1, 2, 0];

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      data-phase="sunrise"
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
        // Swipe left: glide to the start of the next part of the day.
        if (end - start < -60) jumpTo(((Math.floor(tRef.current * 3) + 1) % 3) / 3);
      }}
    >
      {/* Photography: three frames of one place, blended continuously */}
      <div className={cn("absolute inset-0 -z-20 bg-ink", !reduceMotion && "hero-drift")}>
        {slides.map((slide, index) => (
          <div
            key={slide.phase}
            ref={(el) => {
              frameRefs.current[index] = el;
            }}
            className="absolute inset-0"
            // Only the starting state is declared here; the animation loop owns it afterwards.
            style={{ opacity: index === 0 ? 1 : 0, zIndex: initialZ[index] ?? 0 }}
            aria-hidden={index !== 0}
          >
            <Image
              src={slide.src}
              alt={index === 0 ? slide.alt : ""}
              fill
              priority={index === 0}
              loading="eager"
              fetchPriority={index === 0 ? "high" : "low"}
              sizes="100vw"
              // Pre-sized bundled JPEGs: served directly (no optimiser round-trip that can
              // fail or stall), with a blurred preview until each one has decoded.
              unoptimized
              placeholder="blur"
              style={{ objectPosition: FOCAL }}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Sky: every layer's opacity is driven by the timeline */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[15] overflow-hidden">
        <div ref={warmRef} className="hero-sky hero-sky-warm" />
        <div ref={orbRef} className="hero-orb" />
        <div ref={duskRef} className="hero-sky hero-sky-dusk" />
        <div ref={dawnRef} className="hero-sky hero-sky-dawn" />
        <div ref={bloomRef} className="hero-bloom" />

        <div ref={starsRef} className="hero-stars">
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

        {/* Time of day: moment name, draggable slider, quick jumps, play/pause */}
        <motion.div {...rise(0.6)} className="mt-10 border-t border-white/20 pt-5 sm:mt-14">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <div className="flex items-center gap-8">
              {stats.length > 0 ? (
                <dl className="flex gap-8">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">{stat.label}</dt>
                      <dd className="font-display text-3xl text-white">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {count > 1 ? (
              <div className="flex items-center gap-2" role="group" aria-label="Jump to a time of day">
                {JUMPS.map(({ label, t, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => jumpTo(t)}
                    aria-label={`Show ${label}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/30 px-3 text-xs font-medium uppercase tracking-[0.12em] text-white/85 transition-colors hover:border-white hover:bg-white/10"
                  >
                    <Icon aria-hidden="true" className="size-3.5 text-[#e6cf9f]" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? "Play the day cycle" : "Pause the day cycle"}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-white/35 text-white/90 transition-colors hover:border-white hover:bg-white/10"
                >
                  {userPaused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
                </button>
              </div>
            ) : null}
          </div>

          {count > 1 ? (
            <div className="mt-4 flex items-center gap-4">
              <p className="flex w-32 shrink-0 items-center gap-2 text-sm text-white/90">
                <MomentIcon aria-hidden="true" className="size-4 shrink-0 text-[#e6cf9f]" />
                <span key={moment.name} className="hero-label">
                  {moment.name}
                </span>
              </p>
              <input
                ref={sliderRef}
                type="range"
                min={0}
                max={999}
                step={1}
                defaultValue={0}
                aria-label="Time of day"
                aria-valuetext={moment.name}
                onChange={(e) => onScrub(Number(e.target.value))}
                className="hero-scrub"
              />
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
