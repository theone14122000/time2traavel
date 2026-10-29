"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useImageRotation } from "@/hooks/use-image-rotation";

type Slide = { src: string; alt: string };

type Props = {
  images: readonly Slide[];
  title: string;
  tagline: string;
};

export function DestinationHeroGallery({ images, title, tagline }: Props) {
  const reduceMotion = useReducedMotion();
  const [pausedByUser, setPausedByUser] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(true);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const paused = pausedByUser || hovered || focused || !inView;

  const { index, goTo, next, prev, autoAdvance, total } = useImageRotation({
    images,
    interval: 5000,
    paused: reduceMotion ? true : paused,
  });

  // swipe
  const touchStart = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (dx < -50) next();
    else if (dx > 50) prev();
    touchStart.current = null;
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const current = images[index] ?? images[0];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} photo gallery`}
      className="relative w-full overflow-hidden border border-line bg-ink"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      }}
      tabIndex={0}
    >
      <div className="relative min-h-[60vh] w-full md:min-h-[70vh]">
        {images.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              opacity: i === index ? 1 : 0,
              transition: reduceMotion ? "none" : "opacity 0.6s ease-in-out",
            }}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={i === index ? slide.alt : ""}
              fill
              sizes="100vw"
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className="object-cover"
            />
          </div>
        ))}

        {/* scrim + caption panel */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="label-brutal w-fit border border-cream bg-ink/70 px-2 py-1 text-cream">
            Domestic
          </p>
          <h1 className="mt-3 max-w-[18ch] font-display text-h1 leading-[1.05] text-cream">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-base font-medium text-cream/90 sm:text-lg">
            {tagline}
          </p>
        </div>

        {/* controls */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <span className="label-brutal border border-cream bg-ink/70 px-2 py-1 text-cream">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setPausedByUser((p) => !p)}
            aria-label={pausedByUser ? "Play gallery" : "Pause gallery"}
            className="flex size-9 items-center justify-center border border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
          >
            {pausedByUser ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="flex size-9 items-center justify-center border border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="flex size-9 items-center justify-center border border-cream bg-ink/70 text-cream hover:bg-cream hover:text-ink"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto border-t border-line bg-paper p-2 no-scrollbar">
        {images.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "relative h-16 w-24 shrink-0 overflow-hidden border border-line",
              i === index ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100",
            )}
          >
            <Image src={slide.src} alt="" fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
