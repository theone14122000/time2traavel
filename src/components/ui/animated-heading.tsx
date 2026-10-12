"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, headingFadeUp, headingWord, highlightWipe, outlineFill, stagger } from "@/lib/motion";
import { viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ================================================================== *
 * Palette — flat solid colours only (no gradients/blur/glow).        *
 * Ink text on every tone keeps WCAG AA (ink on tomato ≈ 6.4:1).      *
 * ================================================================== */
export type HeadingTone =
  | "sunrise"
  | "mint"
  | "sky"
  | "peach"
  | "lavender"
  | "blush"
  | "tomato";

const TONE_VAR: Record<HeadingTone, string> = {
  sunrise: "var(--tt-sunrise)",
  mint: "var(--tt-mint)",
  sky: "var(--tt-sky)",
  peach: "var(--tt-peach)",
  lavender: "var(--tt-lavender)",
  blush: "var(--tt-blush)",
  tomato: "var(--tt-tomato)",
};

const TONE_ORDER: HeadingTone[] = [
  "tomato",
  "sky",
  "mint",
  "blush",
  "lavender",
  "peach",
  "sunrise",
];

/** Deterministic per-heading tone (stable across server/client renders). */
function pickTone(text: string): HeadingTone {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return TONE_ORDER[hash % TONE_ORDER.length];
}

/** Next tones in the palette rotation — drives the hover tone-cycle. */
function toneCycleVars(tone: HeadingTone): React.CSSProperties {
  const start = TONE_ORDER.indexOf(tone);
  const at = (n: number) => TONE_VAR[TONE_ORDER[(start + n) % TONE_ORDER.length]];
  return {
    ["--t1" as string]: TONE_VAR[tone],
    ["--t2" as string]: at(1),
    ["--t3" as string]: at(2),
    ["--t4" as string]: at(3),
  } as React.CSSProperties;
}

function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/** Front-loaded even chunk so "a b c d" → ["a b", "c", "d"] (3 lines). */
function chunkLines(words: string[], lineCount: number): string[][] {
  if (words.length <= lineCount) return words.map((w) => [w]);
  const base = Math.floor(words.length / lineCount);
  const remainder = words.length % lineCount;
  const sizes = Array.from({ length: lineCount }, (_, i) => base + (i < remainder ? 1 : 0));
  const lines: string[][] = [];
  let cursor = 0;
  for (const size of sizes) {
    lines.push(words.slice(cursor, cursor + size));
    cursor += size;
  }
  return lines;
}

/* ================================================================== *
 * HighlightWord — a single word with a wipe-in palette block.        *
 * ================================================================== */
export function HighlightWord({
  children,
  tone = "sunrise",
  className,
  index = 0,
  animate = true,
}: {
  children: string;
  tone?: HeadingTone;
  className?: string;
  index?: number;
  animate?: boolean;
}) {
  return (
    <span className="heading-mask">
      <motion.span
        className={cn("heading-word heading-highlight", className)}
        custom={index}
        initial={animate ? "hidden" : "visible"}
        variants={headingWord}
        style={{ color: "var(--tt-ink)" }}
      >
        <motion.span
          aria-hidden="true"
          className="heading-highlight-fill block"
          style={{ backgroundColor: TONE_VAR[tone], ...toneCycleVars(tone) }}
          custom={index}
          variants={highlightWipe}
        />
        <span className="relative">{children}</span>
      </motion.span>
    </span>
  );
}

/* ================================================================== *
 * ScribbleUnderline — hand-drawn SVG line that draws itself in view. *
 * ================================================================== */
export function ScribbleUnderline({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute bottom-0 left-0 h-2.5 w-full overflow-visible",
        className,
      )}
    >
      <motion.path
        d="M2 8 C 18 3, 36 11, 56 6 S 96 3, 118 7"
        fill="none"
        stroke="var(--tt-tomato)"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: EASE, delay: reduceMotion ? 0 : 0.55 }}
      />
    </svg>
  );
}

/* ================================================================== *
 * Sticker accent — small rotated burst next to a heading (aria-hidden) *
 * ================================================================== */
function HeadingSticker() {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-2 -top-3 hidden rotate-12 text-lg leading-none text-tomato sm:inline-block"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
        <path d="M12 0l2.4 7.2L21 4.8l-3 6.6 6 1.8-6 1.8 3 6.6-6.6-2.4L12 24l-2.4-7.2L3 19.2l3-6.6-6-1.8 6-1.8-3-6.6 6.6 2.4z" />
      </svg>
    </span>
  );
}

/* ================================================================== *
 * AnimatedHeading — the single heading component for the whole site. *
 * Driven by props: variant, highlight (index/none/auto), tone, delay. *
 * ================================================================== */
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

type AnimatedHeadingBase = {
  as?: HeadingTag;
  id?: string;
  className?: string;
  /** Base delay before the first word moves. */
  delay?: number;
  /** Cream hard-shadow for headings on ink backgrounds. */
  onDark?: boolean;
  /** Skip the hard text-shadow (sub-headings, tight spaces). */
  hard?: boolean;
  /** Render final state immediately (also used for children mode). */
  animate?: boolean;
};

type AnimatedHeadingProps = AnimatedHeadingBase &
  (
    | {
        /** Plain string — full word-splitting treatment. */
        text: string;
        children?: never;
        variant?: "hero" | "section" | "sub";
        /** Word index, "auto" (longest word), or "none". Default: auto. */
        highlight?: number | "auto" | "none";
        highlightTone?: HeadingTone | "auto";
        /** Hero only — split into N lines (default 3) with line treatments. */
        lines?: number;
        /** Hero only — underline a word with the drawn scribble. */
        scribble?: number | null;
        /** Small decorative sticker in the heading corner. */
        sticker?: boolean;
      }
    | {
        /** React node titles (rich copy) — container-level treatment only. */
        children: React.ReactNode;
        text?: never;
        variant?: "section" | "sub";
        highlight?: never;
        highlightTone?: never;
        lines?: never;
        scribble?: never;
        sticker?: boolean;
      }
  );

export function AnimatedHeading({
  as: Tag = "h2",
  id,
  className,
  delay = 0,
  onDark = false,
  hard,
  animate,
  variant = "section",
  text,
  children,
  highlight,
  highlightTone,
  lines,
  scribble,
  sticker = false,
}: AnimatedHeadingProps) {
  const reduceMotion = useReducedMotion();
  const anim = animate ?? !reduceMotion;

  const hardClass =
    hard ?? variant !== "sub"
      ? onDark
        ? "heading-hard-cream"
        : variant === "hero"
          ? "heading-hard-lg"
          : "heading-hard"
      : null;

  const shellClass = cn(
    "font-display uppercase [hyphens:none]",
    hardClass,
    className,
  );

  /* ---------------- Children mode (ReactNode titles) ---------------- */
  if (children !== undefined) {
    if (!anim) {
      return (
        <Tag id={id} className={shellClass}>
          {children}
        </Tag>
      );
    }
    return (
      <Tag id={id} className={shellClass}>
        <motion.span
          className="block"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={headingFadeUp}
          transition={{ delay }}
        >
          {children}
        </motion.span>
      </Tag>
    );
  }

  if (!text) return null;
  const words = splitWords(text);
  if (words.length === 0) return null;

  /* ---------------- Hero mode — 3 treated lines ---------------- */
  if (variant === "hero") {
    const lineCount = Math.min(lines ?? 3, Math.max(words.length, 1));
    const wordLines = chunkLines(words, lineCount);
    const displayLines = wordLines.map((line) => line.join(" "));
    /* Running word index across lines — pure offset, no render mutation. */
    const offsetFor = (lineIdx: number) =>
      wordLines.slice(0, lineIdx).reduce((sum, line) => sum + line.length, 0);

    return (
      <Tag id={id} className={cn("relative", shellClass)}>
        {sticker ? <HeadingSticker /> : null}
        <motion.span
          className="block"
          initial={anim ? "hidden" : "visible"}
          animate="visible"
          variants={stagger(0.08)}
          transition={{ delayChildren: delay }}
        >
          {displayLines.map((line, lineIdx) => {
            const isMiddle = lineIdx === 1 && wordLines.length >= 3;
            const isLast = lineIdx === wordLines.length - 1 && wordLines.length >= 2;

            /* Line treatments: 1) solid ink 2) tomato block, white text
               3) outline that fills on scroll. */
            if (isMiddle) {
              const lineWords = wordLines[lineIdx];
              return (
                <span key={`line-${lineIdx}`} className="block">
                  {lineWords.map((word, wi) => {
                    const globalIndex = offsetFor(lineIdx) + wi;
                    return (
                      <React.Fragment key={`${word}-${wi}`}>
                        {wi > 0 ? " " : null}
                        <span className="heading-mask">
                          <motion.span
                            className="heading-word heading-highlight"
                            style={{ color: "var(--tt-paper)" }}
                            custom={globalIndex}
                            initial={anim ? "hidden" : "visible"}
                            variants={headingWord}
                          >
                            <motion.span
                              aria-hidden="true"
                              className="heading-highlight-fill block"
                              style={{
                                backgroundColor: TONE_VAR.tomato,
                                ...toneCycleVars("tomato"),
                              }}
                              custom={globalIndex}
                              variants={highlightWipe}
                            />
                            <span className="relative">{word}</span>
                          </motion.span>
                        </span>
                      </React.Fragment>
                    );
                  })}
                </span>
              );
            }

            if (isLast && wordLines.length >= 3) {
              /* Outline line — fills with a palette colour on scroll. */
              const lineWords = wordLines[lineIdx];
              return (
                <span key={`line-${lineIdx}`} className="block">
                  {lineWords.map((word, wi) => {
                    const localIndex = offsetFor(lineIdx) + wi;
                    return (
                      <React.Fragment key={`${word}-${wi}`}>
                        {wi > 0 ? " " : null}
                        <span className="heading-mask">
                          <motion.span
                            className="heading-word"
                            custom={localIndex}
                            initial={anim ? "hidden" : "visible"}
                            variants={headingWord}
                          >
                            <span className="relative inline-block">
                              <span className="text-outline">{word}</span>
                              <motion.span
                                aria-hidden="true"
                                className="absolute inset-0 block"
                                style={{ color: TONE_VAR.sky }}
                                initial={anim ? "hidden" : "visible"}
                                variants={outlineFill}
                              >
                                {word}
                              </motion.span>
                            </span>
                          </motion.span>
                        </span>
                      </React.Fragment>
                    );
                  })}
                </span>
              );
            }

            /* Solid ink line (line 1) */
            const lineWords = wordLines[lineIdx];
            return (
              <span key={`line-${lineIdx}`} className="block">
                {lineWords.map((word, wi) => {
                  const localIndex = offsetFor(lineIdx) + wi;
                  const scribbleHere = scribble === localIndex;
                  return (
                    <React.Fragment key={`${word}-${wi}`}>
                      {wi > 0 ? " " : null}
                      <span
                        className={cn(
                          "heading-mask",
                          scribbleHere && "pb-3 -mb-3",
                        )}
                      >
                        <motion.span
                          className="heading-word"
                          custom={localIndex}
                          initial={anim ? "hidden" : "visible"}
                          variants={headingWord}
                        >
                          <span className="relative inline-block">
                            {word}
                            {scribbleHere ? <ScribbleUnderline /> : null}
                          </span>
                        </motion.span>
                      </span>
                    </React.Fragment>
                  );
                })}
              </span>
            );
          })}
        </motion.span>
      </Tag>
    );
  }

  /* ---------------- Section / sub mode — words + one highlight -------- */
  const autoIndex = words.reduce(
    (best, word, i) => (word.length > words[best].length ? i : best),
    0,
  );
  const highlightIndex =
    highlight === undefined || highlight === "auto"
      ? variant === "section"
        ? autoIndex
        : -1
      : highlight === "none"
        ? -1
        : highlight;

  const tone: HeadingTone =
    !highlightTone || highlightTone === "auto"
      ? pickTone(text)
      : highlightTone;

  if (!anim) {
    return (
      <Tag id={id} className={shellClass}>
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            {i > 0 ? " " : null}
            <span className="heading-mask">
              {i === highlightIndex ? (
                <span
                  className="heading-word heading-highlight"
                  style={{ color: "var(--tt-ink)" }}
                >
                  <span
                    aria-hidden="true"
                    className="heading-highlight-fill block"
                    style={{ backgroundColor: TONE_VAR[tone] }}
                  />
                  <span className="relative">{word}</span>
                </span>
              ) : (
                <span className="heading-word">{word}</span>
              )}
            </span>
          </React.Fragment>
        ))}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={cn("relative", shellClass)}>
      {sticker ? <HeadingSticker /> : null}
      <motion.span
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger(0.06)}
        transition={{ delayChildren: delay }}
      >
        {words.map((word, i) => {
          const isHighlight = i === highlightIndex;
          const scribbleHere = scribble === i;
          return (
            <React.Fragment key={`${word}-${i}`}>
              {i > 0 ? " " : null}
              <span
                className={cn("heading-mask", scribbleHere && "pb-3 -mb-3")}
              >
                <motion.span
                  className={cn(
                    "heading-word",
                    isHighlight && "heading-highlight",
                  )}
                  style={isHighlight ? { color: "var(--tt-ink)" } : undefined}
                  custom={i}
                  variants={headingWord}
                >
                  {isHighlight ? (
                    <motion.span
                      aria-hidden="true"
                      className="heading-highlight-fill block"
                      style={{ backgroundColor: TONE_VAR[tone], ...toneCycleVars(tone) }}
                      custom={i}
                      variants={highlightWipe}
                    />
                  ) : null}
                  <span className="relative inline-block">
                    {word}
                    {scribbleHere ? <ScribbleUnderline /> : null}
                  </span>
                </motion.span>
              </span>
            </React.Fragment>
          );
        })}
      </motion.span>
    </Tag>
  );
}

/* ================================================================== *
 * WordSwapper — rotating structural words in a slide-up mask.        *
 * Pauses on hover/focus; static first word under reduced motion.     *
 * ================================================================== */
export function WordSwapper({
  words,
  prefix,
  intervalMs = 2200,
  className,
  tone = "mint",
}: {
  words: readonly string[];
  prefix?: string;
  intervalMs?: number;
  className?: string;
  tone?: HeadingTone;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const list = words.length > 0 ? words : [""];
  const srText = list.join(", ");

  React.useEffect(() => {
    if (reduceMotion || paused || list.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % list.length);
      }
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, intervalMs, list.length]);

  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 font-display text-base font-bold uppercase tracking-tight sm:text-lg",
        className,
      )}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="sr-only">{prefix ? `${prefix} ${srText}` : srText}</span>
      <span aria-hidden="true" className="text-ink">
        {prefix}
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-[1.3em] min-w-[8ch] overflow-hidden"
        style={{ color: "var(--tt-ink)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${list[index]}-${index}`}
            className="heading-highlight absolute left-0 top-0 whitespace-nowrap"
            initial={reduceMotion ? false : { y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "-110%", opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <span
              aria-hidden="true"
              className="heading-highlight-fill block"
              style={{ backgroundColor: TONE_VAR[tone], ...toneCycleVars(tone) }}
            />
            <span className="relative">{list[index]}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}
