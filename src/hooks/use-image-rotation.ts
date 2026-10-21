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
  /** Additional pause conditions (hover, focus, etc.). */
  paused?: boolean;
};

/**
 * Shared auto-rotation engine for hero backgrounds and card slideshows.
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
  paused = false,
}: UseImageRotationOptions) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [saveData, setSaveData] = React.useState(false);

  // Detect Save-Data / low-power
  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) setSaveData(true);
  }, []);

  const autoAdvance = !reduceMotion && !saveData && !paused && images.length > 1;

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
          setIndex((i) => (i + 1) % images.length);
        }
        schedule(interval);
      }, delay);
    };

    // Initial delay carries the phase offset so two rotations never step
    // together.
    schedule(interval - (offset % interval));

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [autoAdvance, interval, offset, images.length]);

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
