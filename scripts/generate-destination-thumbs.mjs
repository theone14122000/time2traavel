#!/usr/bin/env node
/**
 * Generates the WebP thumbnails and the image manifest used by the
 * domestic destinations section and the destination detail pages.
 *
 *   public/images/destinations/thumbs/card/<slug>.webp
 *       800x1000 (4:5) card thumbnail per destination, cropped from its
 *       cover image, quality ~80, focused on the strongest region.
 *
 *   public/images/destinations/thumbs/gallery/<file>.webp
 *       480px-wide gallery thumbnail per source image.
 *
 *   src/lib/destination-images.generated.json
 *       width, height and a tiny base64 blurDataURL per source image.
 *
 * The originals are only ever READ — never modified or moved.
 *
 * Run: `node scripts/generate-destination-thumbs.mjs`
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  CARD_THUMBS_DIR,
  GALLERY_THUMBS_DIR,
  GENERATED_FILE,
  IMAGES_DIR,
  allReferencedFiles,
  parseDestinations,
} from "./lib/parse-destinations.mjs";

const CARD_WIDTH = 800;
const CARD_HEIGHT = 1000;
const CARD_QUALITY = 80;
const GALLERY_WIDTH = 480;
const GALLERY_QUALITY = 72;
const BLUR_WIDTH = 16;

const destinations = parseDestinations();
const referenced = allReferencedFiles(destinations);

await mkdir(CARD_THUMBS_DIR, { recursive: true });
await mkdir(GALLERY_THUMBS_DIR, { recursive: true });

/** Base name without extension, safe for file names. */
function baseName(file) {
  return file.replace(/\.[^.]+$/, "");
}

/** Base64 data URL for a tiny blurred preview (used as the blur placeholder). */
async function blurDataURL(input) {
  const buffer = await sharp(input)
    .resize({ width: BLUR_WIDTH, withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

/**
 * Picks the crop window. `attention` uses sharp's entropy heuristic so
 * the most detailed part of the photo survives the 4:5 crop; it falls
 * back to the centre when the heuristic cannot be computed.
 */
async function cardThumbnail(input) {
  try {
    return await sharp(input)
      .resize({
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fit: "cover",
        position: sharp.strategy.attention,
      })
      .webp({ quality: CARD_QUALITY })
      .toBuffer();
  } catch {
    return sharp(input)
      .resize({
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: CARD_QUALITY })
      .toBuffer();
  }
}

const manifest = {};
let cardCount = 0;
let galleryCount = 0;

for (const file of referenced) {
  const source = join(IMAGES_DIR, file);
  if (!existsSync(source)) {
    console.error(`  SKIP  ${file} — not found on disk`);
    continue;
  }

  const meta = await sharp(source).metadata();
  const blur = await blurDataURL(source);

  // Gallery thumbnail (width 480, original aspect kept).
  const galleryName = `${baseName(file)}.webp`;
  const galleryBuffer = await sharp(source)
    .resize({ width: GALLERY_WIDTH, withoutEnlargement: true })
    .webp({ quality: GALLERY_QUALITY })
    .toBuffer();
  await writeFile(join(GALLERY_THUMBS_DIR, galleryName), galleryBuffer);
  galleryCount += 1;

  manifest[file] = {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    blurDataURL: blur,
    thumbSmall: `/images/destinations/thumbs/gallery/${galleryName}`,
  };

  console.log(
    `  OK  ${file.padEnd(20)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)} -> ${galleryName}`,
  );
}

// Card thumbnail per destination (from its cover image).
for (const destination of destinations) {
  const coverFile =
    destination.images[
      Math.min(destination.coverIndex, destination.images.length - 1)
    ] ?? destination.images[0];
  const source = join(IMAGES_DIR, coverFile);
  if (!existsSync(source)) {
    console.error(`  SKIP  card ${destination.slug} — cover "${coverFile}" missing`);
    continue;
  }

  const buffer = await cardThumbnail(source);
  const cardName = `${destination.slug}.webp`;
  await writeFile(join(CARD_THUMBS_DIR, cardName), buffer);
  cardCount += 1;

  // Blur placeholder matching the actual card thumbnail crop.
  const cardBlur = await blurDataURL(buffer);

  // Point the manifest entry for the cover at the card thumbnail too.
  if (manifest[coverFile]) {
    manifest[coverFile].thumb = `/images/destinations/thumbs/card/${cardName}`;
    manifest[coverFile].thumbBlurDataURL = cardBlur;
  }

  console.log(`  CARD ${destination.slug.padEnd(20)} -> ${cardName}`);
}

// Every image entry gets a `thumb` key (null when it is not a cover) so the
// TypeScript side has a stable shape.
for (const entry of Object.values(manifest)) {
  if (!("thumb" in entry)) entry.thumb = null;
  if (!("thumbBlurDataURL" in entry)) entry.thumbBlurDataURL = null;
}

await writeFile(
  GENERATED_FILE,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  `\ngenerate-destination-thumbs: ${cardCount} card thumbnail(s), ${galleryCount} gallery thumbnail(s), manifest written to src/lib/destination-images.generated.json`,
);
process.exit(0);
