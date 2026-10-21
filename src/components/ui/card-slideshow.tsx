"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useTransform } from "framer-motion";
import { Pause, Play, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import { useImageRotation } from "@/hooks/use-image-rotation";

type SlideshowImage = { src: string; alt: string };

type CardSlideshowProps = {
  images: readonly SlideshowImage[];
  /** Accessible label for the region. */
  label: string;
  className?: string;
};

/**
 * Auto-toggling portrait card slideshow for the Himalayas band.
 *
 * Variant "stack": 4:5 portrait with two peeking cards behind.
 * Autoplay 4.5s, pauses on hover/focus/touch-hold/hidden/offscreen.
 * Drag swipe, keyboard arrows/Home/End, pause/play + prev/next controls.
 * Reduced-motion / Save-Data = manual only. <2 images = static.
 */
export function CardSlideshow({ images, label, className }: CardSlideshowProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [pausedByUser, setPausedByUser] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(true);

  // IntersectionObserver for offscreen pause
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const paused = hovered || focused || touched || pausedByUser || !inView;

  const { index, current, goTo, next, prev, autoAdvance, total } = useImageRotation({
    images,
    interval: 4500,
    offset: 2250, // phase offset vs hero (6s)
    paused,
  });

  // Drag swipe
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 0, 200], [-8, 0, 8]);

  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x < -60 || info.velocity.x < -300) next();
    else if (info.offset.x > 60 || info.velocity.x > 300) prev();
  };

  // Static fallbacks
  if (images.length === 0) {
    return (
      <div className={cn("relative aspect-[4/5] min-h-[380px] border-[3px] border-cream/90 bg-ink/60", className)}>
        <p className="absolute inset-0 grid place-items-center p-6 text-center text-cream/70">
          Himalayan photos will appear here once published from the admin.
        </p>
      </div>
    );
  }

  if (images.length === 1 || reduceMotion) {
    const img = images[0]!;
    return (
      <figure className={cn("relative aspect-[4/5] min-h-[380px] overflow-hidden border-[3px] border-cream/90 bg-ink", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="eager" />
      </figure>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative aspect-[4/5] min-h-[380px] lg:max-h-[560px]", className)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home") { e.preventDefault(); goTo(0); }
        else if (e.key === "End") { e.preventDefault(); goTo(total - 1); }
      }}
      tabIndex={0}
    >
      {/* Peek cards behind */}
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 scale-[0.88] translate-y-[28px] rotate-2 border-[3px] border-cream/40 bg-ink/50" />
        <div className="absolute inset-0 scale-[0.94] translate-y-[14px] -rotate-2 border-[3px] border-cream/60 bg-ink/70" />
      </div>

      {/* Active card */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure
          key={`${current?.src}-${index}`}
          className="absolute inset-0 overflow-hidden border-[3px] border-cream/90 bg-ink shadow-brutal-lg"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: "120%", rotate: 8 }}
          transition={{ duration: 0.45, ease: EASE }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          style={{ x: dragX, rotate: autoAdvance ? 0 : rotate }}
          onDragEnd={onDragEnd}
        >
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.src}
              alt={current.alt}
              className="h-full w-full object-cover"
              loading={index < 2 ? "eager" : "lazy"}
              draggable={false}
            />
          ) : null}
        </motion.figure>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPausedByUser((p) => !p)}
            aria-label={pausedByUser ? "Play slideshow" : "Pause slideshow"}
            className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/80 text-cream hover:bg-cream hover:text-ink"
          >
            {pausedByUser ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/80 text-cream hover:bg-cream hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/80 text-cream hover:bg-cream hover:text-ink"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>

        <span aria-live="polite" className="label-brutal border-[2px] border-cream bg-ink/80 px-2 py-1 text-cream">
          {index + 1} of {total}
        </span>
      </div>

      {/* Progress dots */}
      <div aria-hidden="true" className="absolute inset-x-3 top-3 z-10 flex gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 border border-cream/50",
              i === index ? "bg-lemon" : "bg-cream/20",
            )}
          />
        ))}
      </div>

      {/* Screen-reader slide list */}
      <ul className="sr-only">
        {images.map((img, i) => (
          <li key={img.src}>
            {i === index ? `Slide ${i + 1} of ${total}: ${img.alt}` : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
