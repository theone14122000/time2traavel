"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

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
  /** "off" while auto-advancing, "polite" once paused or manually changed. */
  liveMode?: "off" | "polite";
  /** Called with the src of a slide that finished loading. */
  onSlideReady?: (src: string) => void;
};

const CROSSFADE_MS = 1100;

/**
 * A framed photo stack that cross-fades between slides.
 *
 * All slides stay mounted and stacked (absolute, inset-0); only the
 * opacity/transform of the active layer changes — no unmount, no blank gap
 * between slides. Every layer renders through `ImageWithFallback`, so a
 * broken photo falls through to the next candidate and finally to the
 * poster art instead of ever showing its alt text.
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
  liveMode = "off",
  onSlideReady,
}: Props) {
  const reduceMotion = useReducedMotion();
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
          // Fallback chain: this slide, then the remaining slides, so a
          // broken photo is replaced by another real one.
          const fallbackSrcs = slides
            .filter((s) => s.src !== slide.src)
            .map((s) => s.src);
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
              <ImageWithFallback
                src={slide.src}
                alt={isActive ? slide.alt : ""}
                fallbackSrcs={fallbackSrcs}
                poster={poster}
                sizes={sizes}
                quality={quality}
                priority={priorityFirst && i === 0}
                blurDataURL={undefined}
                className="h-full w-full"
                imageClassName={cn(
                  "object-cover",
                  isActive && !reduceMotion && "animate-kenburns",
                  layerClassName,
                )}
                onLoaded={(loadedSrc) => onSlideReady?.(loadedSrc)}
              />
            </div>
          );
        })}
      </div>

      {/* Screen-reader announcements */}
      <div className="sr-only" aria-live={liveMode}>
        {announceLabel
          ? `${announceLabel} ${index + 1} of ${total}`
          : `Image ${index + 1} of ${total}`}
      </div>
    </div>
  );
}
