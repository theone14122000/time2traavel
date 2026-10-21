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
  kashmir: "Jammu & Kashmir",
  ladakh: "Ladakh",
  sikkim: "Sikkim",
  northeast: "Northeast India",
  andaman: "Andaman & Nicobar",
  rajasthan: "Rajasthan",
  kerala: "Kerala",
  goa: "Goa",
  gujarat: "Gujarat",
  tamilnadu: "Tamil Nadu",
  uttarpradesh: "Uttar Pradesh",
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
 *
 * Keys are manifest filenames (folder included), e.g. "destinations/JK1.jpg".
 */
const FILENAME_LABELS: Record<string, string> = {
  "hero/slide-1.jpg": "Himachal Pradesh",
  "hero/slide-2.jpg": "Jammu & Kashmir",
  "hero/slide-3.jpg": "Uttarakhand",
  "hero/slide-4.jpg": "Bali",
  "hero/slide-5.jpg": "Dubai",
  "destinations/JK1.jpg": "Jammu & Kashmir",
  "destinations/himachal1.jpg": "Himachal Pradesh",
  "destinations/assam1.jpg": "Assam",
  "destinations/gujrat1.jpg": "Gujarat",
  "destinations/rajisthan1.jpg": "Rajasthan",
  "destinations/tamil1.jpg": "Tamil Nadu",
  "destinations/UP1.jpg": "Uttar Pradesh",
  "destinations/utrakhand1.jpg": "Uttarakhand",
};

function placeNameFor(entry: ImageManifestEntry): string {
  const named = FILENAME_LABELS[entry.filename];
  if (named) return named;
  // Generic fallback: human-readable region name.
  const regionLabel = labelFor(entry);
  if (regionLabel !== "On the road") return regionLabel;
  // Last resort: the file's own stem, never a folder path (an alt that
  // reads "hero/slide 1" is meaningless to a screen reader).
  const stem = entry.filename.split("/").pop() ?? entry.filename;
  return stem.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
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
  return pickByFilename([
    "destinations/himachal1.jpg",
    "destinations/JK1.jpg",
  ]).slice(0, 2);
}

/**
 * Domestic destination photo grid — used when no published destinations
 * exist in the database. One photo per major region we have assets for.
 */
export function getDomesticFallbacks(): FallbackImage[] {
  return pickByFilename([
    "destinations/himachal1.jpg",
    "destinations/JK1.jpg",
    "destinations/utrakhand1.jpg",
    "destinations/assam1.jpg",
    "destinations/gujrat1.jpg",
    "destinations/rajisthan1.jpg",
    "destinations/tamil1.jpg",
    "destinations/UP1.jpg",
  ]);
}

/**
 * International photo strip — used when no published international
 * destinations exist. Each filename is a verified international place.
 */
export function getInternationalFallbacks(): FallbackImage[] {
  return pickByFilename([
    "hero/slide-4.jpg",
    "hero/slide-5.jpg",
    "hero/slide-3.jpg",
    "hero/slide-1.jpg",
    "hero/slide-2.jpg",
  ]);
}

/**
 * Gallery fallbacks — six varied photos across regions for the masonry
 * grid when the admin hasn't uploaded gallery items yet.
 */
export function getGalleryFallbacks(): FallbackImage[] {
  return pickByFilename([
    "destinations/himachal2.jpg",
    "destinations/JK2.jpg",
    "destinations/utrakhand2.jpg",
    "destinations/assam2.jpg",
    "destinations/gujrat2.jpg",
    "destinations/rajisthan2.jpg",
    "destinations/tamil2.jpg",
    "destinations/UP2.jpg",
  ]).slice(0, 8);
}
