"use client";

import * as React from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FrameSlide = { src: string; alt: string };

type Props = {
  slides: readonly FrameSlide[];
  /** Accessible label for the carousel region. */
  label: string;
  /** Index of the slide to display (controlled). */
  index: number;
  /** `next/image` sizes hint. */
  sizes?: string;
  /** Image quality (1-100). */
  quality?: number;
  /** Eagerly load the first slide (above the fold). */
  priorityFirst?: boolean;
  /** Extra classes for the clipping container. */
  className?: string;
  /** Extra classes for the stacked image layers. */
  layerClassName?: string;
  /** Rendered under the images (poster art) when every slide fails. */
  poster?: React.ReactNode;
  /** Prefix for the screen-reader announcement. */
  announceLabel?: string;
};

const CROSSFADE_MS = 1100;

/**
 * A framed photo stack that cross-fades between slides.
 *
 * All slides stay mounted and stacked (absolute, inset-0); only the
 * opacity/transform of the active layer changes — no unmount, no blank gap
 * between slides. A broken slide falls back to the next candidate and,
 * when every candidate fails, the poster art takes over, so a failed image
 * never shows its alt text.
 */
export function HeroFrameSlideshow({
  slides,
  label,
  index,
  sizes = "(min-width: 1024px) 45vw, 90vw",
  quality = 80,
  priorityFirst = false,
  className,
  layerClassName,
  poster,
  announceLabel,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = React.useState<Record<string, boolean>>({});
  const total = slides.length;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("group relative h-full w-full", className)}
    >
      {/* Clipping layer: isolated + GPU friendly so rotated frames never
          flicker or show edge artifacts in Safari/Chrome. */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          isolation: "isolate",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {slides.map((slide, i) => {
          const isActive = i === index;
          const isBroken = failed[slide.src];
          return (
            <div
              key={slide.src}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transition: reduceMotion
                  ? "none"
                  : `opacity ${CROSSFADE_MS}ms ease-in-out`,
                willChange: isActive ? "opacity, transform" : undefined,
              }}
              aria-hidden={!isActive}
            >
              {isBroken ? null : (
                <Image
                  src={slide.src}
                  alt={isActive ? slide.alt : ""}
                  fill
                  sizes={sizes}
                  quality={quality}
                  priority={priorityFirst && i === 0}
                  loading={priorityFirst && i === 0 ? undefined : "lazy"}
                  decoding="async"
                  draggable={false}
                  data-frame-slide={i}
                  onError={() =>
                    setFailed((prev) => ({ ...prev, [slide.src]: true }))
                  }
                  className={cn(
                    "object-cover",
                    isActive && !reduceMotion && "animate-kenburns",
                    layerClassName,
                  )}
                />
              )}
            </div>
          );
        })}

        {slides.every((slide) => failed[slide.src]) && poster ? poster : null}
      </div>

      {/* Screen-reader announcements */}
      <div className="sr-only" aria-live="off">
        {announceLabel
          ? `${announceLabel} ${index + 1} of ${total}`
          : `Image ${index + 1} of ${total}`}
      </div>
    </div>
  );
}
