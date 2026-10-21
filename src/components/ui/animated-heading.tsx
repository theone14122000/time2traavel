"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, headingFadeUp, headingWord, stagger } from "@/lib/motion";
import { viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { GradientWord } from "@/components/ui/gradient-word";
import { parseHeadingAccent, type HeadingGradientTone } from "@/lib/heading-accents";

/* ================================================================== *
 * AnimatedHeading — the single heading component for the whole site. *
 * Word-mask entrance + exactly one GradientWord accent per heading.   *
 * No background fills, markers or highlight blocks behind words.      *
 * ================================================================== */
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

type AnimatedHeadingBase = {
  as?: HeadingTag;
  id?: string;
  className?: string;
  /** Base delay before the first word moves. */
  delay?: number;
  /** Gradient tone for the accent word (defaults via onDark). */
  gradientTone?: HeadingGradientTone;
  /** Hard-shadow for headings on ink backgrounds. */
  onDark?: boolean;
  /** Opt-in hard text-shadow (sub-headings, tight spaces). */
  hard?: boolean;
  /** Render final state immediately (also used for children mode). */
  animate?: boolean;
};

type AnimatedHeadingProps = AnimatedHeadingBase &
  (
    | {
        /** Plain string — full word-splitting treatment. Supports [[accent]]. */
        text: string;
        children?: never;
        variant?: "hero" | "section" | "sub";
        /** Hero only — split into N lines (default 3). */
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
  gradientTone,
  onDark = false,
  hard,
  animate,
  variant = "section",
  text,
  children,
  lines,
  scribble,
  sticker = false,
}: AnimatedHeadingProps) {
  const reduceMotion = useReducedMotion();
  const anim = animate ?? !reduceMotion;

  const resolvedTone: HeadingGradientTone = gradientTone ?? (onDark ? "onDark" : "ink");

  const hardClass =
    hard ?? false
      ? onDark
        ? "heading-hard-cream"
        : variant === "hero"
          ? "heading-hard-lg"
          : "heading-hard"
      : null;

  const isHeadingTag = Tag === "h1" || Tag === "h2" || Tag === "h3" || Tag === "h4";

  const shellClass = cn(
    "[hyphens:none]",
    !isHeadingTag && (variant === "sub" ? "font-hand" : "font-script"),
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
  const { words, accentIndex } = parseHeadingAccent(text);
  if (words.length === 0) return null;

  /* ---------------- Hero mode — 3 treated lines ---------------- */
  if (variant === "hero") {
    const lineCount = Math.min(lines ?? 3, Math.max(words.length, 1));
    const wordLines = chunkLines(words, lineCount);
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
          {wordLines.map((lineWords, lineIdx) => {
            const offset = offsetFor(lineIdx);
            return (
              <span key={`line-${lineIdx}`} className="block">
                {lineWords.map((word, wi) => {
                  const globalIndex = offset + wi;
                  const isAccent = globalIndex === accentIndex;
                  const scribbleHere = scribble === globalIndex;
                  return (
                    <React.Fragment key={`${word}-${wi}`}>
                      {wi > 0 ? " " : null}
                      <span
                        className={cn("heading-mask", scribbleHere && "pb-3 -mb-3")}
                      >
                        <motion.span
                          className="heading-word"
                          custom={globalIndex}
                          initial={anim ? "hidden" : "visible"}
                          variants={headingWord}
                        >
                          <span className="relative inline-block">
                            {isAccent ? (
                              <GradientWord tone={resolvedTone}>{word}</GradientWord>
                            ) : (
                              word
                            )}
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

  /* ---------------- Section / sub mode — words + one gradient accent ---- */
  if (!anim) {
    return (
      <Tag id={id} className={shellClass}>
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            {i > 0 ? " " : null}
            <span className="heading-mask">
              <span className="heading-word">
                {i === accentIndex ? (
                  <GradientWord tone={resolvedTone}>{word}</GradientWord>
                ) : (
                  word
                )}
              </span>
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
          const isAccent = i === accentIndex;
          const scribbleHere = scribble === i;
          return (
            <React.Fragment key={`${word}-${i}`}>
              {i > 0 ? " " : null}
              <span className={cn("heading-mask", scribbleHere && "pb-3 -mb-3")}>
                <motion.span
                  className="heading-word"
                  custom={i}
                  variants={headingWord}
                >
                  <span className="relative inline-block">
                    {isAccent ? (
                      <GradientWord tone={resolvedTone}>{word}</GradientWord>
                    ) : (
                      word
                    )}
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
 * ScribbleUnderline — hand-drawn SVG line that draws itself in view. *
 * (Underline stroke, not a filled block — allowed by the spec.)       *
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
 * WordSwapper — rotating structural words in a slide-up mask.        *
 * Pauses on hover/focus; static first word under reduced motion.     *
 * ================================================================== */
export function WordSwapper({
  words,
  prefix,
  intervalMs = 2200,
  className,
}: {
  words: readonly string[];
  prefix?: string;
  intervalMs?: number;
  className?: string;
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
            className="absolute left-0 top-0 whitespace-nowrap"
            initial={reduceMotion ? false : { y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "-110%", opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {list[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

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
