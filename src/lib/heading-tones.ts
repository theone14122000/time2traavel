/**
 * Heading tone config — maps section keys to gradient tone families.
 * Each tone's stops are derived from --tt-* tokens and pass ≥3:1 contrast
 * against the section's background (verified by check-contrast.mjs).
 *
 * No two adjacent homepage sections share the same tone.
 */
import type { HeadingGradientTone } from "@/lib/heading-accents";

export const HEADING_TONES: Record<string, HeadingGradientTone> = {
  // Homepage sections (order matches page.tsx render pipeline)
  hero: "onDark",
  domestic: "ink",
  mountains: "onDark",
  international: "ocean",
  featured_packages: "flame",
  why_choose: "plum",
  services: "forest",
  how_it_works: "ink",
  trip_types: "flame",
  destination_finder: "ocean",
  gallery: "ink",
  reviews: "plum",
  guides: "ocean",
  founder: "aurora",
  faq: "ink",
  final_cta: "onDark",

  // Page-level defaults
  about: "ink",
  contact: "flame",
  destinations: "ink",
  packages: "flame",
  default: "ink",
} as const;

export function headingToneFor(sectionKey: string): HeadingGradientTone {
  return HEADING_TONES[sectionKey] ?? HEADING_TONES.default!;
}
