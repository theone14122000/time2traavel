import { IMAGE_MANIFEST } from "@/lib/image-manifest";

export type HeroSlide = { src: string; alt: string };

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
const HERO_SLIDES: ReadonlyArray<{ file: string; alt: string }> = [
  {
    file: "hero/slide-1.jpg",
    alt: "Snow-covered Himalayan peaks rising above a pine forest",
  },
  {
    file: "hero/slide-2.jpg",
    alt: "A timber house in a green meadow with forested mountains behind",
  },
  {
    file: "hero/slide-3.jpg",
    alt: "Winding roads crossing the high-altitude Leh valley in Ladakh",
  },
  {
    file: "hero/slide-4.jpg",
    alt: "The Tanah Lot sea temple on a cliff above the ocean in Bali",
  },
  {
    file: "hero/slide-5.jpg",
    alt: "The Dubai skyline at night with illuminated highways and towers",
  },
];

/**
 * Resolves the curated hero slides against the scanned manifest.
 * Any file missing from the manifest is skipped, so a broken path can
 * never render a broken image.
 */
export function getHeroSlides(): HeroSlide[] {
  const slides: HeroSlide[] = [];
  for (const { file, alt } of HERO_SLIDES) {
    const entry = IMAGE_MANIFEST.find((e) => e.filename === file);
    if (!entry) continue;
    slides.push({ src: entry.url, alt });
  }
  return slides;
}
