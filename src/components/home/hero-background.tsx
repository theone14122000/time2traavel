"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeroSlide = { src: string; alt: string };

type HeroBackgroundProps = {
  slides: readonly HeroSlide[];
  /** Index of the slide to display (controlled by the hero clock). */
  index: number;
  /** 0-1 fill of the current slide's progress segment. */
  progress: number;
  /** True while the rotation is paused. */
  paused: boolean;
  /** True when the user paused it explicitly. */
  pausedByUser: boolean;
  onTogglePause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  /** "off" while auto-advancing, "polite" once paused or manually changed. */
  liveMode?: "off" | "polite";
  /** Called with the src of a slide that finished loading. */
  onSlideReady?: (src: string) => void;
};

const CROSSFADE_MS = 1200;

/**
 * Full-bleed hero background — auto-rotating photographs with a smooth
 * 1.2s crossfade, Ken Burns 1→1.06 on desktop only, and an ink scrim
 * (68% → 30% + bottom fade) so the heading text stays AA.
 *
 * Smoothness notes:
 *  - every slide is stacked in the DOM and fades with a plain CSS opacity
 *    transition, so the outgoing frame is still on screen while the
 *    incoming one fades in — no black gap, no layout shift;
 *  - frames are served through next/image (optimised, `sizes="100vw"`), so
 *    five full-bleed photographs cost a fraction of their raw weight;
 *  - the first frame is `priority` (preloaded, fetchPriority=high) and the
 *    rest load lazily at low priority, keeping LCP on the headline.
 *
 * Stacking: the photo layer lives in its own `z-0` stacking context so the
 * hero copy (z-10) always sits on top of it, while the playback controls
 * (z-50) stay clickable above everything.
 */
export function HeroBackground({
  slides,
  index,
  progress,
  paused,
  pausedByUser,
  onTogglePause,
  onNext,
  onPrev,
  onGoTo,
  liveMode = "off",
  onSlideReady,
}: HeroBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const total = slides.length;
  const touchStart = React.useRef<number | null>(null);

  const duration = reduceMotion ? 0 : CROSSFADE_MS;

  if (total === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (dx < -50) onNext();
    else if (dx > 50) onPrev();
  };

  return (
    <>
      {/* Photo layer — own stacking context, always beneath the hero copy. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 overflow-hidden bg-ink"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.src}
              className={cn("absolute inset-0", isActive ? "z-10" : "z-0")}
              style={{
                opacity: isActive ? 1 : 0,
                transition: `opacity ${duration}ms ease-in-out`,
                willChange: isActive ? "opacity, transform" : undefined,
              }}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                {...(i === 0 ? { fetchPriority: "high" as const } : {})}
                loading={i === 0 ? undefined : "lazy"}
                decoding="async"
                draggable={false}
                onLoad={() => onSlideReady?.(slide.src)}
                className={cn(
                  "object-cover",
                  isActive && !paused && !reduceMotion && "animate-kenburns",
                )}
              />
            </div>
          );
        })}

        {/* Scrim: ink 68% top → 30% mid, bottom fade to cream */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(22,20,31,0.68) 0%, rgba(22,20,31,0.42) 45%, rgba(22,20,31,0.30) 70%, rgba(255,250,240,0.08) 100%)",
          }}
        />
      </div>

      {/* Pause/play + segment indicators — above the hero copy, still clickable. */}
      <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 sm:bottom-6 sm:right-6">
        <span className="label-brutal border-[2px] border-cream bg-ink/70 px-2 py-1 text-cream">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={pausedByUser ? "Play background slideshow" : "Pause background slideshow"}
          className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
        >
          {pausedByUser ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous slide"
          className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next slide"
          className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Screen-reader announcements for the background layer */}
      <div className="sr-only" aria-live={liveMode}>
        Background photo {index + 1} of {total}
      </div>

      {/* Segmented progress indicators */}
      <div className="absolute bottom-4 left-4 z-50 flex gap-1.5 sm:bottom-6 sm:left-6">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => onGoTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 w-10 overflow-hidden border border-cream/50 bg-cream/20"
          >
            <span
              className="block h-full bg-lemon"
              style={{
                width:
                  i < index
                    ? "100%"
                    : i === index
                      ? `${Math.round(progress * 100)}%`
                      : "0%",
                transition: i === index ? "none" : "width 200ms linear",
              }}
            />
          </button>
        ))}
      </div>
    </>
  );
}
