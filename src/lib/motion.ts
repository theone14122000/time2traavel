/**
 * Shared Framer Motion variants — single source of truth for motion.
 * Pure data only (no hooks/JSX) so it can be imported anywhere.
 * Every animation built on these must stay reduced-motion friendly:
 * consumers should gate with `useReducedMotion()` or use the wrappers
 * in `@/components/shared/motion`.
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DURATION = {
  fast: 0.25,
  base: 0.45,
  slow: 0.65,
} as const;

/** Fade + slide up from 28px — the default content reveal. */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
} as const;

/** Fade only — for elements that must not shift layout. */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
} as const;

/** Pop-in with a slight overshoot — badges, stickers, chips. */
export const popIn = {
  hidden: { opacity: 0, scale: 0.86 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASE },
  },
} as const;

/** Stagger container — pair with `fadeUp`/`popIn` children. */
export function stagger(staggerDelay = 0.08) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: staggerDelay } },
  } as const;
}

/** Slide in from a side — for drawers, trays, side panels. */
export function slideIn(from: "left" | "right" | "top" | "bottom" = "left", distance = 40) {
  const offset =
    from === "left"
      ? { x: -distance, y: 0 }
      : from === "right"
        ? { x: distance, y: 0 }
        : from === "top"
          ? { x: 0, y: -distance }
          : { x: 0, y: distance };
  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: DURATION.base, ease: EASE },
    },
  } as const;
}

/** Card hover: lift + tiny tilt ("sticker" feel). Use with `whileHover`. */
export const tiltOnHover = {
  rest: { rotate: 0, y: 0, scale: 1 },
  hover: {
    rotate: -1.2,
    y: -6,
    scale: 1.01,
    transition: { duration: DURATION.fast, ease: EASE },
  },
} as const;

/** Section-title masked slide-up (use inside an `overflow-hidden` wrapper). */
export const maskReveal = {
  hidden: { y: "110%" },
  visible: { y: 0, transition: { duration: DURATION.base, ease: EASE } },
} as const;

/* ------------------------------------------------------------------ *
 * Animated-heading variants (transform/opacity/clip-path only).       *
 * ------------------------------------------------------------------ */

/** Spring config for masked word reveals — smooth with a small overshoot. */
export const SPRING = { type: "spring", stiffness: 260, damping: 32 } as const;

/** A single heading word: masked slide-up, driven by a custom index. */
export const headingWord = {
  hidden: { y: "115%" },
  visible: (i: number) => ({
    y: 0,
    transition: { ...SPRING, delay: i * 0.06 },
  }),
} as const;

/** Highlight block wipe: scaleX 0 → 1 from the left, after its word. */
export const highlightWipe = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: { duration: 0.32, ease: EASE, delay: i * 0.06 + 0.24 },
  }),
} as const;

/** Outline text fill: clip-path reveal from the baseline upward. */
export const outlineFill = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.55, ease: EASE, delay: 0.55 },
  },
} as const;

/** Light section-heading entrance: fade + 16px lift (once, in view). */
export const headingFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
} as const;

/** Default viewport config for scroll-triggered reveals. */
export const viewportOnce = { once: true, amount: 0.2 } as const;
