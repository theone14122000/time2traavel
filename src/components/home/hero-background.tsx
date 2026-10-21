"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useImageRotation } from "@/hooks/use-image-rotation";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeroSlide = { src: string; alt: string };

type HeroBackgroundProps = {
  slides: readonly HeroSlide[];
};

const CROSSFADE_MS = 1200;
const INTERVAL = 6000;

export function HeroBackground({ slides }: HeroBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const [pausedByUser, setPausedByUser] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const paused = pausedByUser || hovered || focused || !inView;

  const { index, goTo, next, prev, autoAdvance, total } = useImageRotation({
    images: slides,
    interval: INTERVAL,
    paused: reduceMotion ? true : paused,
  });

  // progress fill
  React.useEffect(() => {
    if (reduceMotion || !autoAdvance || paused) {
      setProgress(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / INTERVAL);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, reduceMotion, autoAdvance, paused]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (slides.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (dx < -50) next();
    else if (dx > 50) prev();
    setTouchStart(null);
  };

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden bg-ink"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={-1}
    >
      {slides.map((slide, i) => {
        const isActive = i === index;
        return (
          <div
            key={slide.src}
            className={cn("absolute inset-0", isActive ? "z-10" : "z-0")}
            style={{
              opacity: isActive ? 1 : 0,
              clipPath:
                isActive && !reduceMotion
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  : undefined,
              transition: reduceMotion
                ? "none"
                : `opacity ${CROSSFADE_MS}ms ease-in-out`,
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
              className={cn(
                "object-cover",
                isActive && autoAdvance && !reduceMotion && "animate-kenburns",
              )}
            />
          </div>
        );
      })}

      {/* diagonal clip-path wipe layer on desktop (CSS-driven via animate-kenburns? use separate) */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(22,20,31,0.68) 0%, rgba(22,20,31,0.42) 45%, rgba(22,20,31,0.30) 70%, rgba(255,250,240,0.08) 100%)",
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 sm:bottom-6 sm:right-6">
        <span className="label-brutal border-[2px] border-cream bg-ink/70 px-2 py-1 text-cream">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => setPausedByUser((p) => !p)}
          aria-label={pausedByUser ? "Play background slideshow" : "Pause background slideshow"}
          className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
        >
          {pausedByUser ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="flex size-9 items-center justify-center border-[2px] border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Segmented progress indicators */}
      <div className="absolute bottom-4 left-4 z-50 flex gap-1.5 sm:bottom-6 sm:left-6">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 w-10 overflow-hidden border border-cream/50 bg-cream/20"
          >
            <span
              className="block h-full bg-lemon transition-[width]"
              style={{
                width:
                  i < index
                    ? "100%"
                    : i === index
                      ? `${Math.round(progress * 100)}%`
                      : "0%",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
