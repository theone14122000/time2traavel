"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  MapPin,
  Plane,
  Plus,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { CountUp } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Wordmark } from "@/components/brand/wordmark";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import { EASE, stagger, fadeUp } from "@/lib/motion";

export type HeroTile = { src: string | null; alt: string };

type HeroProps = {
  title: string;
  subtitle: string;
  instruction: string;
  /** Real database counts only (never invented). */
  counts?: { destinations: number; packages: number };
  /** Destination images from the database — empty list renders the illustrated fallback. */
  tiles?: HeroTile[];
  founderName?: string | null;
};

/** Accurate category chips — drawn from the site's real taxonomy. */
const CATEGORY_CHIPS = [
  { label: "Himachal", href: "/destinations" },
  { label: "Ladakh", href: "/destinations" },
  { label: "Kashmir", href: "/destinations" },
  { label: "International", href: "/destinations/international" },
  { label: "Custom Trips", href: "/plan-my-trip" },
] as const;

/* ------------------------------------------------------------------ *
 * Illustrated mountain fallback — SVG silhouettes (no fake photos).   *
 * ------------------------------------------------------------------ */
function MountainIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 640 400"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="640" height="400" fill="var(--tt-sky)" />
      {/* sun */}
      <circle cx="500" cy="96" r="44" fill="var(--tt-lemon)" stroke="var(--tt-ink)" strokeWidth="4" />
      {/* far range */}
      <path
        d="M0 260 L120 140 L200 220 L300 100 L420 230 L520 130 L640 250 L640 400 L0 400 Z"
        fill="var(--tt-mint-strong)"
        stroke="var(--tt-ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* near range */}
      <path
        d="M0 320 L90 220 L170 290 L280 180 L400 300 L500 210 L640 310 L640 400 L0 400 Z"
        fill="var(--tt-mint)"
        stroke="var(--tt-ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* snow caps */}
      <path d="M300 100 L270 140 L290 132 L310 148 L330 128 L350 142 Z" fill="var(--tt-paper)" stroke="var(--tt-ink)" strokeWidth="3" />
      <path d="M120 140 L98 172 L114 166 L130 178 L146 160 Z" fill="var(--tt-paper)" stroke="var(--tt-ink)" strokeWidth="3" />
      {/* foreground hills */}
      <path
        d="M0 380 L140 300 L260 360 L400 290 L540 370 L640 320 L640 400 L0 400 Z"
        fill="var(--tt-cream)"
        stroke="var(--tt-ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Flight-route decoration — dotted arc + paper plane.                 *
 * ------------------------------------------------------------------ */
function RouteDecoration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 90"
      className={className}
      fill="none"
    >
      <path
        d="M10 70 Q 80 0, 210 40"
        stroke="var(--tt-ink)"
        strokeWidth="2.5"
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
      <g transform="translate(200 32) rotate(24)">
        <path
          d="M0 8 L18 0 L10 14 L8 8 Z"
          fill="var(--tt-tomato)"
          stroke="var(--tt-ink)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Star accent — small comic sparkle.                                  *
 * ------------------------------------------------------------------ */
function StarAccent({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0l2.4 7.2L21 4.8l-3 6.6 6 1.8-6 1.8 3 6.6-6.6-2.4L12 24l-2.4-7.2L3 19.2l3-6.6-6-1.8 6-1.8-3-6.6 6.6 2.4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Hero heading — comic cover lettering.                               *
 * 5+ words → 3 lines with the final word in a coral block.            *
 * ------------------------------------------------------------------ */
function HeroHeading({ title }: { title: string }) {
  const reduceMotion = useReducedMotion();
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const lastWord = words[words.length - 1];
  const rest = words.slice(0, -1);

  let lines: string[][];
  if (rest.length >= 4) {
    const a = Math.ceil(rest.length / 2);
    lines = [rest.slice(0, a), rest.slice(a), [lastWord]];
  } else if (rest.length >= 2) {
    lines = [rest.slice(0, 1), rest.slice(1), [lastWord]];
  } else {
    lines = [[...rest, lastWord].filter(Boolean)];
  }

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { y: "110%", opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.55, ease: EASE, delay },
        };

  const line = (content: React.ReactNode, delay: number, key: string) => (
    <span key={key} className="block overflow-hidden pb-1 -mb-1">
      <motion.span className="block" {...rise(delay)}>
        {content}
      </motion.span>
    </span>
  );

  return (
    <h1
      id="hero-heading"
      className="mt-4 max-w-[12ch] font-display text-[clamp(2rem,9.5vw,3.5rem)] uppercase leading-[0.95] tracking-tight text-ink lg:text-[clamp(3.1rem,4.8vw,5.25rem)]"
    >
      {lines.map((lineWords, i) => {
        const isLast = i === lines.length - 1 && lines.length >= 3;
        const delay = 0.12 + i * 0.1;
        if (isLast) {
          return line(
            <span className="comic-panel comic-panel-tomato [text-shadow:2px_2px_0_var(--tt-ink)]">
              {lineWords.join(" ")}
            </span>,
            delay,
            `l${i}`,
          );
        }
        return line(lineWords.join(" "), delay, `l${i}`);
      })}
    </h1>
  );
}

/* ------------------------------------------------------------------ *
 * Right-side layered composition.                                     *
 * ------------------------------------------------------------------ */
function HeroComposition({ tiles }: { tiles: HeroTile[] }) {
  const reduceMotion = useReducedMotion();
  const primary = tiles[0] ?? null;
  const secondary = tiles[1] ?? null;
  const anim = !reduceMotion;

  const pop = (delay: number) =>
    anim
      ? {
          initial: { opacity: 0, scale: 0.88, rotate: -2 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5, ease: EASE, delay },
        }
      : {};

  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
      {/* dotted backdrop */}
      <div
        aria-hidden="true"
        className="dots-field absolute -left-4 -top-4 h-[85%] w-[90%] border-[3px] border-ink bg-paper"
      />

      {/* main image frame */}
      <motion.figure
        className="relative z-10 aspect-[4/3] overflow-hidden border-[4px] border-ink bg-paper shadow-brutal-md"
        style={{ rotate: "-1.5deg" }}
        {...(anim
          ? {
              initial: { opacity: 0, clipPath: "inset(8% 8% 8% 8%)" },
              animate: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
              transition: { duration: 0.7, ease: EASE, delay: 0.35 },
            }
          : {})}
      >
        {primary?.src ? (
          <BrutalImage
            src={primary.src}
            alt={primary.alt}
            decorative={!primary.alt}
            aspect="free"
            priority
            sizes="(max-width: 1024px) 90vw, 42vw"
            className="h-full w-full"
          />
        ) : (
          <MountainIllustration />
        )}
        {/* corner tape */}
        <span
          aria-hidden="true"
          className="absolute -left-3 -top-3 h-6 w-16 rotate-[-18deg] border-2 border-ink bg-lemon/80"
        />
        <span
          aria-hidden="true"
          className="absolute -right-3 -top-3 h-6 w-16 rotate-[16deg] border-2 border-ink bg-lemon/80"
        />
      </motion.figure>

      {/* overlapping mini card — secondary image or location chip card */}
      <motion.div
        className="absolute -bottom-6 -left-2 z-20 w-[46%] max-w-[210px] sm:-left-6"
        {...pop(0.55)}
        style={{ rotate: "2.5deg" }}
      >
        <div className="border-[3px] border-ink bg-paper p-2 shadow-brutal-sm">
          {secondary?.src ? (
            <div className="aspect-[4/3] overflow-hidden border-2 border-ink">
              <BrutalImage
                src={secondary.src}
                alt={secondary.alt}
                decorative={!secondary.alt}
                aspect="free"
                sizes="210px"
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center border-2 border-ink bg-mint">
              <Compass aria-hidden="true" className="size-10 text-mint-strong" strokeWidth={2.5} />
            </div>
          )}
          <p className="label-brutal mt-2 px-0.5 text-ink-soft">From the hills</p>
        </div>
      </motion.div>

      {/* location badge */}
      <motion.div
        className="absolute -right-1 top-4 z-20 sm:-right-4"
        {...pop(0.65)}
      >
        <span className="label-brutal inline-flex items-center gap-1.5 border-[3px] border-ink bg-paper px-2.5 py-2 shadow-hard-xs">
          <MapPin aria-hidden="true" className="size-3.5 text-tomato" />
          Shimla, India
        </span>
      </motion.div>

      {/* adventure sticker */}
      <motion.div
        className="absolute -bottom-3 right-2 z-20 sm:right-6"
        {...pop(0.75)}
      >
        <span
          className="sticker float-gentle bg-tomato text-cream"
          style={{ rotate: "4deg" }}
        >
          Adventure mode: on!
        </span>
      </motion.div>

      {/* speech bubble */}
      <motion.div
        className="absolute -top-10 right-4 z-20 hidden sm:block"
        {...pop(0.7)}
      >
        <span
          className="speech-bubble float-gentle-slow inline-block bg-paper text-ink"
          style={{ rotate: "-3deg" }}
        >
          <span className="label-brutal text-ink">Where to next?</span>
        </span>
      </motion.div>

      {/* route + stars */}
      <motion.div
        className="absolute -top-8 left-8 z-20 hidden sm:block"
        {...pop(0.7)}
      >
        <RouteDecoration className="float-gentle-slow h-16 w-40" />
      </motion.div>
      <motion.div
        className="absolute -right-2 bottom-16 z-20 hidden text-lemon sm:block"
        {...pop(0.8)}
      >
        <StarAccent className="float-gentle size-6 drop-shadow-[2px_2px_0_var(--tt-ink)]" />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hero — "the world is your next comic book" magazine cover.          *
 * ------------------------------------------------------------------ */
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
  const visibleTiles: HeroTile[] = tiles.slice(0, 2);
  const animate = !reduceMotion;

  const container = stagger(0.1);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full overflow-hidden border-b-[3px] border-ink bg-cream clip-x"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0" />
      {/* soft corner wash — navy, not yellow */}
      <span
        aria-hidden="true"
        className="absolute -right-24 -top-24 size-72 rounded-full bg-sky/40 blur-[2px] sm:size-96"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-20 -left-16 size-52 rotate-12 border-[3px] border-ink bg-mint sm:size-64"
      />

      <Container className="relative px-6 pb-16 pt-12 sm:pb-14 sm:pt-14 lg:px-10 lg:py-20 xl:px-12">
        <motion.div
          initial={animate ? "hidden" : "show"}
          animate="show"
          variants={container}
          className="grid items-center gap-10 lg:grid-cols-12 lg:gap-10"
        >
          {/* -------- Copy column -------- */}
          <div className="lg:col-span-6 xl:col-span-6">
            <motion.div variants={fadeUp}>
              <Wordmark size="lg" href={null} />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-5">
              <span className="label-brutal inline-flex w-fit max-w-full items-center gap-2 border-[3px] border-ink bg-lemon px-2.5 py-2 text-[0.65rem] shadow-hard-xs sm:px-3 sm:text-xs">
                <Sparkles aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="min-w-0">Issue No. 01 — the world awaits</span>
              </span>
            </motion.div>

            <HeroHeading title={title} />

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lead"
            >
              {subtitle}
            </motion.p>

            {/* CTA pair */}
            <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto"
              >
                <a href="#destinations">
                  Explore destinations
                  <ArrowRight aria-hidden="true" className="size-5" />
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => openPlanner({})}
              >
                <Plus aria-hidden="true" className="size-5" />
                Build my adventure
              </Button>
            </motion.div>

            {/* category chips */}
            <motion.ul
              variants={fadeUp}
              className="mt-6 flex flex-wrap gap-2"
              aria-label="Travel categories"
            >
              {CATEGORY_CHIPS.map((chip) => (
                <li key={chip.label}>
                  <Link
                    href={chip.href}
                    className="label-brutal inline-flex min-h-11 items-center border-[3px] border-ink bg-paper px-3 py-2 text-ink transition hover:bg-sky focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {chip.label}
                  </Link>
                </li>
              ))}
            </motion.ul>

            {/* real catalogue counts */}
            {counts && (counts.destinations > 0 || counts.packages > 0) ? (
              <motion.dl
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-6 border-t-[3px] border-ink/15 pt-6"
              >
                <div>
                  <dt className="label-brutal text-ink-soft">Destinations</dt>
                  <dd className="mt-1 font-display text-3xl leading-none text-ink">
                    <CountUp value={counts.destinations} />
                  </dd>
                </div>
                <div>
                  <dt className="label-brutal text-ink-soft">Packages</dt>
                  <dd className="mt-1 font-display text-3xl leading-none text-ink">
                    <CountUp value={counts.packages} />
                  </dd>
                </div>
                {founderName ? (
                  <div className="min-w-0">
                    <dt className="label-brutal text-ink-soft">Founded by</dt>
                    <dd className="mt-1 text-sm font-bold text-ink">{founderName}</dd>
                  </div>
                ) : null}
              </motion.dl>
            ) : null}
          </div>

          {/* -------- Composition column -------- */}
          <motion.div
            className="lg:col-span-6 xl:col-span-6"
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <HeroComposition tiles={visibleTiles} />
            {instruction ? (
              <p className="label-brutal mt-10 text-center text-ink-soft lg:mt-8">
                <Plane aria-hidden="true" className="mr-1.5 inline size-3.5 -translate-y-0.5" />
                {instruction}
              </p>
            ) : null}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
