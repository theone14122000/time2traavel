"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

type RotationImage = { src: string; alt: string };

type UseImageRotationOptions = {
  images: readonly RotationImage[];
  /** Milliseconds between auto-advances. */
  interval?: number;
  /** Phase offset in ms — desyncs two rotations so they never step together. */
  offset?: number;
  /**
   * Extra delay (ms) applied to the FIRST auto-advance only. Used to make a
   * second rotation change a fixed moment after the first one.
   */
  phase?: number;
  /** Index shown before the first auto-advance. */
  initialIndex?: number;
  /** Additional pause conditions (hover, focus, etc.). */
  paused?: boolean;
  /**
   * Guard run before every auto-advance. Resolve `false` to postpone the
   * advance to the next tick (used to wait for the next image to decode).
   */
  beforeAdvance?: (nextIndex: number) => boolean | Promise<boolean>;
};

/**
 * Shared auto-rotation engine for hero backgrounds, hero frames and
 * carousels.
 *
 * Respects: prefers-reduced-motion (never auto-advances), Page Visibility
 * API (pauses when tab hidden), Save-Data / low-power heuristics
 * (never auto-advances when Save-Data is on).
 *
 * Returns the current index, a setter for manual controls, and whether
 * auto-rotation is currently active.
 */
export function useImageRotation({
  images,
  interval = 6000,
  offset = 0,
  phase = 0,
  initialIndex = 0,
  paused = false,
  beforeAdvance,
}: UseImageRotationOptions) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(initialIndex);
  const [saveData, setSaveData] = React.useState(false);

  // Detect Save-Data / low-power
  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) setSaveData(true);
  }, []);

  // A new starting index (e.g. a remounted frame) resets the rotation.
  React.useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const autoAdvance = !reduceMotion && !saveData && !paused && images.length > 1;

  // `index` is read through a ref so the timer is not re-created on every
  // slide change.
  const indexRef = React.useRef(index);
  React.useEffect(() => {
    indexRef.current = index;
  }, [index]);

  React.useEffect(() => {
    if (!autoAdvance) return;

    // A single self-rescheduling timeout instead of setTimeout + setInterval:
    // the two-timer version fired the first tick twice (the timeout and the
    // interval's first tick landed on the same millisecond) and skipped a
    // slide on every rotation.
    let cancelled = false;
    let timer: number | undefined;

    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        if (document.visibilityState === "visible") {
          const next = (indexRef.current + 1) % images.length;
          const allowed = beforeAdvance
            ? beforeAdvance(next)
            : true;
          void Promise.resolve(allowed).then((ok) => {
            if (cancelled) return;
            if (ok !== false) setIndex(next);
            // When the guard postpones the advance, try again on the next
            // tick instead of skipping the slide.
            schedule(ok === false ? Math.min(interval, 400) : interval);
          });
          return;
        }
        schedule(interval);
      }, delay);
    };

    // Initial delay carries the phase offset so two rotations never step
    // together.
    schedule(interval - (offset % interval) + phase);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
    // `index` is read through a ref so the timer is not re-created on every
    // slide change.
  }, [autoAdvance, interval, offset, phase, images.length, beforeAdvance]);

  const goTo = React.useCallback(
    (i: number) => setIndex(((i % images.length) + images.length) % images.length),
    [images.length],
  );
  const next = React.useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  const current = images[index] ?? images[0] ?? null;

  return {
    index,
    current,
    goTo,
    next,
    prev,
    autoAdvance,
    total: images.length,
  };
}
