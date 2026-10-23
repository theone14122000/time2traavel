import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Shared reader for `src/lib/domestic-destinations.ts`.
 *
 * The TypeScript module is the single source of truth for the eight
 * domestic destinations. The build scripts (validation + thumbnail
 * generation) run on plain Node and cannot import TS, so they parse the
 * file's regular structure instead of duplicating the data.
 *
 * Expected shape per destination block:
 *   slug: "jammu-and-kashmir",
 *   ...
 *   images: [ "JK1.jpg", ... ],
 *   coverIndex: 0,
 */

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const DATA_FILE = join(ROOT, "src", "lib", "domestic-destinations.ts");
export const IMAGES_DIR = join(ROOT, "public", "images", "destinations");
export const INTERNATIONAL_IMAGES_DIR = join(IMAGES_DIR, "international");
export const THUMBS_DIR = join(IMAGES_DIR, "thumbs");
export const CARD_THUMBS_DIR = join(THUMBS_DIR, "card");
export const GALLERY_THUMBS_DIR = join(THUMBS_DIR, "gallery");
export const GENERATED_FILE = join(
  ROOT,
  "src",
  "lib",
  "destination-images.generated.json",
);

export const INTERNATIONAL_DESTINATIONS = [
  { slug: "dubai", name: "Dubai (UAE)", images: ["dubai1.jpg","dubai2.jpg","dubai3.jpg","dubai4.jpg"], coverIndex: 0 },
  { slug: "nepal", name: "Nepal", images: ["nepal1.jpg","nepal2.jpg","nepal3.jpg","nepal4.jpg","nepal5.jpg"], coverIndex: 0 },
  { slug: "bhutan", name: "Bhutan", images: ["bhutan1.jpg","bhutan2.jpg","bhutan3.jpg","bhutan4.jpg","bhutan5.jpg","bhutan6.jpg"], coverIndex: 0 },
  { slug: "singapore", name: "Singapore", images: ["singapore1.jpg","singapore2.jpg","singapore3.jpg","singapore4.jpg","singapore5.jpg"], coverIndex: 0 },
  { slug: "sri-lanka", name: "Sri Lanka", images: ["lanka1.jpg","lanka2.jpg","lanka3.jpg","lanka4.jpg","lanka5.jpg","lanka6.jpg"], coverIndex: 0 },
];

/** @typedef {{ slug: string, images: string[], coverIndex: number }} ParsedDestination */

/**
 * Parses the destination blocks out of the TypeScript data module.
 * @returns {ParsedDestination[]}
 */
export function parseDestinations() {
  const source = readFileSync(DATA_FILE, "utf8");

  // Each destination object starts with `slug: "<value>"` and ends before the next slug.
  const slugMatches = [...source.matchAll(/slug:\s*"([^"]+)"/g)];
  if (slugMatches.length === 0) {
    throw new Error(
      "parse-destinations: no `slug: \"...\"` entries found in " + DATA_FILE,
    );
  }

  /** @type {ParsedDestination[]} */
  const out = [];

  for (let i = 0; i < slugMatches.length; i += 1) {
    const start = slugMatches[i].index;
    const end =
      i + 1 < slugMatches.length ? slugMatches[i + 1].index : source.length;
    const block = source.slice(start, end);

    const imagesMatch = block.match(/images:\s*\[([\s\S]*?)\]/);
    if (!imagesMatch) {
      throw new Error(
        `parse-destinations: no \`images: [...]\` array for slug "${slugMatches[i][1]}"`,
      );
    }

    const images = [...imagesMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    if (images.length === 0) {
      throw new Error(
        `parse-destinations: empty \`images\` array for slug "${slugMatches[i][1]}"`,
      );
    }

    const coverMatch = block.match(/coverIndex:\s*(\d+)/);
    const coverIndex = coverMatch ? Number(coverMatch[1]) : 0;

    out.push({ slug: slugMatches[i][1], images, coverIndex });
  }

  return out;
}

/** Every referenced original file, de-duplicated, in first-seen order. */
export function allReferencedFiles(destinations) {
  const seen = new Set();
  const files = [];
  for (const destination of destinations) {
    for (const file of destination.images) {
      if (seen.has(file)) continue;
      seen.add(file);
      files.push(file);
    }
  }
  return files;
}
