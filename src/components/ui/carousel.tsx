"use client";

import * as React from "react";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselTone = "paper" | "butter" | "sky" | "mint" | "peach" | "lavender";

const toneClasses: Record<CarouselTone, string> = {
  paper: "bg-paper",
  butter: "bg-butter",
  sky: "bg-sky",
  mint: "bg-mint",
  peach: "bg-peach",
  lavender: "bg-lavender",
};

export interface CarouselProps {
  /** One node per slide. Each is wrapped in a full-width track cell. */
  items: React.ReactNode[];
  /** Accessible label for the carousel region. */
  label: string;
  /** Background tone for the viewport frame. */
  tone?: CarouselTone;
  /** Allow wrapping past the first/last slide. */
  loop?: boolean;
  className?: string;
}

/**
 * Generic brutalist carousel: drag to swipe, keyboard arrows, square dots,
 * and a live slide counter. Fully functional under reduced motion (instant jumps).
 *
 * @example
 * <Carousel
 *   label="Featured destination photos"
 *   items={photos.map((p) => <BrutalImage key={p.id} src={p.url} alt={p.alt} />)}
 * />
 */
export function Carousel({ items, label, tone = "paper", loop = false, className }: CarouselProps) {
  const count = items.length;
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const clamp = React.useCallback(
    (i: number) => {
      if (count === 0) return 0;
      if (loop) {
        return ((i % count) + count) % count;
      }
      return Math.min(Math.max(i, 0), count - 1);
    },
    [count, loop],
  );

  const goTo = React.useCallback((i: number) => setIndex(clamp(i)), [clamp]);

  const onDragEnd = React.useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold) {
        goTo(index + 1);
      } else if (info.offset.x > threshold) {
        goTo(index - 1);
      }
    },
    [goTo, index],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      }
    },
    [goTo, index],
  );

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn("relative border-[3px] border-ink shadow-hard", toneClasses[tone], className)}
    >
      <div className="relative overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex"
          drag={reduceMotion ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={reduceMotion ? undefined : onDragEnd}
          animate={{ x: `-${index * 100}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: EASE }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="min-w-full shrink-0 grow-0 basis-full"
              aria-hidden={i !== index}
              inert={i !== index}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t-[3px] border-ink bg-paper px-3 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0 && !loop}
            aria-label="Previous slide"
            className="tap-44 inline-flex size-11 items-center justify-center border-[3px] border-ink bg-lemon shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1 && !loop}
            aria-label="Next slide"
            className="tap-44 inline-flex size-11 items-center justify-center border-[3px] border-ink bg-lemon shadow-hard-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "size-3.5 border-[2px] border-ink transition-colors",
                i === index ? "bg-lemon" : "bg-paper hover:bg-butter",
              )}
            />
          ))}
        </div>

        <p aria-live="polite" className="label-brutal tabular-nums whitespace-nowrap text-xs">
          {index + 1} / {count}
        </p>
      </div>
    </div>
  );
}
