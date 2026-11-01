import type { StaticImageData } from "next/image";
import { IMAGE_MANIFEST } from "@/lib/image-manifest";
import daySunrise from "@/assets/brand/day-sunrise.jpg";
import dayMidday from "@/assets/brand/day-midday.jpg";
import dayNight from "@/assets/brand/day-night.jpg";

export type HeroSlide = { src: string; alt: string; label: string };

export type DayPhase = "sunrise" | "midday" | "night";
export type DayCycleSlide = {
  phase: DayPhase;
  /** Bundled import: carries width/height and a blur preview, and is served from /_next/static. */
  src: StaticImageData;
  alt: string;
  label: string;
};

/**
 * The hero's sunrise → midday → night loop. All three photographs frame the
 * same Himalayan ridge, so cross-dissolving them reads as a time-lapse of one
 * place. The frames are web-sized progressive JPEGs (~250–430 KB) in
 * src/assets/brand, generated from the full-resolution originals in
 * public/images/hero (Radiant Alpine Sunrise Panorama.png, slide-1.jpg,
 * night.png). They are imported (not referenced by URL) so the bundler emits
 * and serves them itself: they cannot 404 from a stale public-file list and
 * they get a blur-up preview for free.
 * Alt text describes what is visible in each file.
 */
const DAY_CYCLE: ReadonlyArray<DayCycleSlide> = [
  {
    phase: "sunrise",
    src: daySunrise,
    alt: "The sun rising between snow-covered Himalayan peaks, lighting the slopes gold",
    label: "Sunrise",
  },
  {
    phase: "midday",
    src: dayMidday,
    alt: "Snow-covered Himalayan peaks above a pine forest under a clear blue sky",
    label: "Midday",
  },
  {
    phase: "night",
    src: dayNight,
    alt: "The same snowy peaks under a full moon and a starry night sky",
    label: "Night",
  },
];

export function getDayCycleSlides(): DayCycleSlide[] {
  return [...DAY_CYCLE];
}

/**
 * Curated hero rotation — the five photographs stored in
 * /public/images/hero (slide-1 … slide-5).
 *
 * Order is intentional and fixed: three Himalayan frames (snow peaks,
 * Kashmir meadow, Ladakh valley) followed by two international frames
 * (Bali sea temple, Dubai skyline) so the brand hero shows the full
 * range of trips on offer.
 *
 * Alt text describes what is actually visible in each file (verified by
 * inspection) — no invented place names. URLs are resolved through the
 * auto-generated IMAGE_MANIFEST so the rotation stays in sync with the
 * image scan.
 */
const HERO_SLIDES: ReadonlyArray<{ file: string; alt: string; label: string }> = [
  {
    file: "hero/slide-1.jpg",
    alt: "Snow-covered Himalayan peaks rising above a pine forest",
    label: "The Himalayas",
  },
  {
    file: "hero/slide-2.jpg",
    alt: "A timber house in a green meadow with forested mountains behind",
    label: "Mountain meadows",
  },
  {
    file: "hero/slide-3.jpg",
    alt: "Winding roads crossing the high-altitude Leh valley in Ladakh",
    label: "Leh, Ladakh",
  },
  {
    file: "hero/slide-4.jpg",
    alt: "The Tanah Lot sea temple on a cliff above the ocean in Bali",
    label: "Tanah Lot, Bali",
  },
  {
    file: "hero/slide-5.jpg",
    alt: "The Dubai skyline at night with illuminated highways and towers",
    label: "Dubai",
  },
];

/**
 * Resolves the curated hero slides against the scanned manifest.
 * Any file missing from the manifest is skipped, so a broken path can
 * never render a broken image.
 */
export function getHeroSlides(): HeroSlide[] {
  const slides: HeroSlide[] = [];
  for (const { file, alt, label } of HERO_SLIDES) {
    const entry = IMAGE_MANIFEST.find((e) => e.filename === file);
    if (!entry) continue;
    slides.push({ src: entry.url, alt, label });
  }
  return slides;
}
