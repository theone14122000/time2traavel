"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { useImageRotation } from "@/hooks/use-image-rotation";

export type HeroSlide = { src: string; alt: string };

type Options = {
  /** The five hero photographs, in rotation order. */
  slides: readonly HeroSlide[];
  /** Master tick length (ms) for the large frame. */
  interval?: number;
  /** How long the small frame lags behind the large one (ms). */
  lag?: number;
  /** Index offset of the background layer (keeps it off the frames' photo). */
  backgroundOffset?: number;
  /** Index offset of the large frame. */
  largeOffset?: number;
  /** Index offset of the small frame. */
  smallOffset?: number;
};

/**
 * One clock for the whole hero.
 *
 * Three surfaces show the same five photographs at once — the full-bleed
 * background, the large postcard frame and the small polaroid frame. They
 * are driven from a single master tick with fixed index offsets, so no two
 * surfaces can ever display the same photograph at the same time:
 *
 *   background  = master + backgroundOffset
 *   large frame = master + largeOffset
 *   small frame = master + smallOffset   (lags `lag` ms behind)
 *
 * The small frame's lag keeps it on the previous photo for a moment after
 * the large frame has moved on, which is why its offset differs from the
 * background's.
 */
export function useHeroSlideshow({
  slides,
  interval = 5000,
  lag = 1500,
  backgroundOffset = 3,
  largeOffset = 0,
  smallOffset = 2,
}: Options) {
  const reduceMotion = useReducedMotion();
  const total = slides.length;

  const [pausedByUser, setPausedByUser] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [inView, setInView] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const containerRef = React.useRef<HTMLElement | null>(null);

  const paused = pausedByUser || hovered || focused || !inView;

  /** Callback ref for the hero section so offscreen pausing works. */
  const setContainer = React.useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  /**
   * Slides whose bitmap is already decoded. The rotation waits for the
   * next slide to be ready, so a crossfade never reveals a half-loaded
   * photograph.
   */
  const decoded = React.useRef<Set<string>>(new Set());

  const markSlideReady = React.useCallback((src: string) => {
    decoded.current.add(src);
  }, []);

  /** Decode the slide that is about to be shown. */
  const preloadSlide = React.useCallback(
    async (src: string) => {
      if (typeof window === "undefined") return true;
      if (decoded.current.has(src)) return true;
      try {
        const img = new window.Image();
        img.src = src;
        if (typeof img.decode === "function") {
          await img.decode();
        } else {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("decode failed"));
          });
        }
        decoded.current.add(src);
        return true;
      } catch {
        // The file could not be decoded (missing or corrupt). Remember it so
        // the rotation does not stall on it forever; the frame itself falls
        // back to the next candidate.
        decoded.current.add(src);
        return true;
      }
    },
    [],
  );

  const rotation = useImageRotation({
    images: slides,
    interval,
    paused: reduceMotion ? true : paused,
    beforeAdvance: React.useCallback(
      (nextIndex: number) => {
        const slide = slides[nextIndex];
        if (!slide) return true;
        return preloadSlide(slide.src);
      },
      [slides, preloadSlide],
    ),
  });

  const { index: masterIndex, next, prev, goTo, autoAdvance } = rotation;

  // Offscreen pause
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Small frame: follows the master `lag` ms later.
  const [smallIndex, setSmallIndex] = React.useState(
    (smallOffset + largeOffset) % Math.max(total, 1),
  );
  const lastMaster = React.useRef(masterIndex);
  React.useEffect(() => {
    if (masterIndex === lastMaster.current) return;
    const forward = masterIndex === (lastMaster.current + 1) % Math.max(total, 1);
    lastMaster.current = masterIndex;
    if (reduceMotion) {
      setSmallIndex((masterIndex + smallOffset) % Math.max(total, 1));
      return;
    }
    const timer = window.setTimeout(() => {
      setSmallIndex((i) => (i + (forward ? 1 : total - 1) + total) % Math.max(total, 1));
    }, lag);
    return () => window.clearTimeout(timer);
  }, [masterIndex, lag, reduceMotion, smallOffset, total]);

  // Progress fill for the segmented indicator
  React.useEffect(() => {
    if (reduceMotion || !autoAdvance || paused) {
      setProgress(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / interval);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [masterIndex, reduceMotion, autoAdvance, paused, interval]);

  const at = (offset: number) =>
    total > 0 ? (masterIndex + offset + total * 2) % total : 0;

  /**
   * Screen-reader live mode: "off" while the slideshow auto-advances
   * (a moving target is not announced), "polite" once it is paused or the
   * visitor drives it manually.
   */
  const [manuallyChanged, setManuallyChanged] = React.useState(false);
  const liveMode: "off" | "polite" =
    pausedByUser || manuallyChanged || !autoAdvance ? "polite" : "off";

  // The manual flag lapses shortly after, so the region goes quiet again
  // while the rotation is still running.
  React.useEffect(() => {
    if (!manuallyChanged) return;
    const timer = window.setTimeout(() => setManuallyChanged(false), 4000);
    return () => window.clearTimeout(timer);
  }, [manuallyChanged]);

  const goNext = React.useCallback(() => {
    setManuallyChanged(true);
    next();
  }, [next]);

  const goPrev = React.useCallback(() => {
    setManuallyChanged(true);
    prev();
  }, [prev]);

  const goToSlide = React.useCallback(
    (i: number) => {
      setManuallyChanged(true);
      goTo(i);
    },
    [goTo],
  );

  return {
    /** Attach to the hero section so offscreen pausing works. */
    setContainer,
    slides,
    total,
    /** Index for the full-bleed background layer. */
    backgroundIndex: at(backgroundOffset),
    /** Index for the large postcard frame. */
    largeIndex: at(largeOffset),
    /** Index for the small polaroid frame. */
    smallIndex,
    next: goNext,
    prev: goPrev,
    goTo: goToSlide,
    progress,
    paused,
    pausedByUser,
    liveMode,
    /** Records a slide whose bitmap is decoded and ready to be shown. */
    markSlideReady,
    togglePause: React.useCallback(() => setPausedByUser((p) => !p), []),
    autoAdvance,
    setHovered,
    setFocused,
  };
}
