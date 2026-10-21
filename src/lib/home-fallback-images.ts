import { IMAGE_MANIFEST } from "@/lib/image-manifest";
import type { ImageManifestEntry } from "@/lib/image-manifest";

/**
 * Local image fallbacks for homepage sections when the CMS database is
 * empty. Every entry is sourced from the auto-generated IMAGE_MANIFEST
 * (public/images), so URLs and region tags stay in sync with the scan.
 *
 * Captions and alt text use the verified filename → place mapping only.
 * No invented claims, prices, or package data — just real photos with
 * honest place labels.
 */

export type FallbackImage = {
  src: string;
  alt: string;
  /** Short caption for card/figure footers. */
  caption: string;
  /** Region tag for badges. */
  regionLabel: string;
};

/** Human-readable region names for badges. */
const REGION_LABELS: Record<string, string> = {
  himachal: "Himachal Pradesh",
  uttarakhand: "Uttarakhand",
  kashmir: "Kashmir",
  ladakh: "Ladakh",
  sikkim: "Sikkim",
  northeast: "Northeast India",
  andaman: "Andaman & Nicobar",
  rajasthan: "Rajasthan",
  kerala: "Kerala",
  goa: "Goa",
  international: "International",
  UNASSIGNED: "On the road",
};

function labelFor(entry: ImageManifestEntry): string {
  return REGION_LABELS[entry.region] ?? "On the road";
}

/**
 * Verified filename → place name. Each mapping comes straight from the
 * image filename (the file is photo OF that place). International files
 * get their specific place name; domestic files use their region.
 */
const FILENAME_LABELS: Record<string, string> = {
  "bali.jpg": "Bali",
  "dubai.jpg": "Dubai",
  "nepal.jpg": "Nepal",
  "singapore.jpg": "Singapore",
  "thailand.jpg": "Thailand",
  "himachal1.jpg": "Himachal Pradesh",
  "himachal2.jpg": "Himachal Pradesh",
  "kashmir.jpg": "Kashmir",
  "kashmir2.jpg": "Kashmir",
  "leh1.jpg": "Ladakh",
  "leh2.jpg": "Ladakh",
  "utrakhand.jfif": "Uttarakhand",
  "utrakhand2.jfif": "Uttarakhand",
  "andaman1.jpg": "Andaman & Nicobar",
  "andaman2.jpg": "Andaman & Nicobar",
  "nort-east.jpg": "Northeast India",
  "kinnaur1.jpg": "Himachal Pradesh",
  "landscape.jpg": "On the road",
};

function placeNameFor(entry: ImageManifestEntry): string {
  const named = FILENAME_LABELS[entry.filename];
  if (named) return named;
  // Generic fallback: human-readable region name.
  const regionLabel = labelFor(entry);
  if (regionLabel !== "On the road") return regionLabel;
  // Last resort: prettified filename stem (never shown for curated picks).
  return entry.filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function pickByFilename(filenames: string[]): FallbackImage[] {
  const out: FallbackImage[] = [];
  for (const name of filenames) {
    const entry = IMAGE_MANIFEST.find((e) => e.filename === name);
    if (!entry) continue;
    const place = placeNameFor(entry);
    out.push({
      src: entry.url,
      alt: `${place} — travel photograph`,
      caption: place,
      regionLabel: labelFor(entry),
    });
  }
  return out;
}

/**
 * Hero tile fallbacks — two domestic mountain photos shown in the hero
 * composition when the database has no destination images yet.
 * Curated from visually verified files (snow peaks + green valley).
 */
export function getHeroTileFallbacks(): FallbackImage[] {
  return pickByFilename(["himachal1.jpg", "kashmir.jpg"]).slice(0, 2);
}

/**
 * Domestic destination photo grid — used when no published destinations
 * exist in the database. One photo per major region we have assets for.
 */
export function getDomesticFallbacks(): FallbackImage[] {
  return pickByFilename([
    "himachal1.jpg",
    "kashmir.jpg",
    "leh1.jpg",
    "utrakhand.jfif",
    "andaman1.jpg",
    "nort-east.jpg",
  ]);
}

/**
 * International photo strip — used when no published international
 * destinations exist. Each filename is a verified international place.
 */
export function getInternationalFallbacks(): FallbackImage[] {
  return pickByFilename([
    "bali.jpg",
    "dubai.jpg",
    "nepal.jpg",
    "singapore.jpg",
    "thailand.jpg",
  ]);
}

/**
 * Gallery fallbacks — six varied photos across regions for the masonry
 * grid when the admin hasn't uploaded gallery items yet.
 */
export function getGalleryFallbacks(): FallbackImage[] {
  return pickByFilename([
    "himachal2.jpg",
    "kashmir2.jpg",
    "leh2.jpg",
    "andaman2.jpg",
    "nort-east.jpg",
    "utrakhand2.jfif",
    "landscape.jpg",
    "kinnaur1.jpg",
  ]).slice(0, 8);
}
