#!/usr/bin/env node
/**
 * Image governance gate — fails the build when the manifest has
 * domestic/international placement conflicts, missing alt text, or
 * unknown regions.
 *
 * Run: `node scripts/check-images.mjs`
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "src", "lib", "image-manifest.ts");

if (!existsSync(MANIFEST_PATH)) {
  console.error("check-images: image-manifest.ts not found — run `npm run images:scan` first");
  process.exit(1);
}

const raw = readFileSync(MANIFEST_PATH, "utf8");
// Extract the JSON-like array body between "IMAGE_MANIFEST ... = [" and "] as const;"
const arrayMatch = raw.match(/IMAGE_MANIFEST\s*:[\s\S]*?=\s*(\[[\s\S]*?\])\s*as const/);
if (!arrayMatch) {
  console.error("check-images: could not parse IMAGE_MANIFEST array");
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(arrayMatch[1]);
} catch {
  console.error("check-images: failed to JSON.parse IMAGE_MANIFEST body");
  process.exit(1);
}

const errors = [];
const warnings = [];

// 1. Every entry must have a non-empty suggestedAlt.
for (const img of manifest) {
  if (!img.suggestedAlt || img.suggestedAlt.trim().length === 0) {
    errors.push(`Missing suggestedAlt: ${img.url} (${img.region})`);
  }
}

// 2. Region must be one of the known set.
const KNOWN_REGIONS = new Set([
  "himachal", "ladakh", "kashmir", "uttarakhand", "sikkim",
  "northeast", "andaman", "rajasthan", "kerala", "goa",
  "international", "UNASSIGNED",
]);
for (const img of manifest) {
  if (!KNOWN_REGIONS.has(img.region)) {
    errors.push(`Unknown region "${img.region}" on ${img.url}`);
  }
}

// 3. Domestic pool must contain no international images and vice versa.
const domestic = manifest.filter((i) => i.isDomestic);
const international = manifest.filter((i) => !i.isDomestic && i.region !== "UNASSIGNED");
for (const img of domestic) {
  if (img.region === "international") {
    errors.push(`Domestic/international conflict: ${img.url} marked isDomestic but region=international`);
  }
}
for (const img of international) {
  if (img.isDomestic) {
    errors.push(`International/domestic conflict: ${img.url} marked !isDomestic but region=${img.region}`);
  }
}

// 4. At least 1 image per major Indian region used by the homepage.
const REQUIRED = ["himachal", "ladakh", "kashmir", "uttarakhand", "northeast", "andaman"];
for (const r of REQUIRED) {
  const count = manifest.filter((i) => i.region === r).length;
  if (count === 0) {
    warnings.push(`Region "${r}" has 0 images — homepage sections may show fallback`);
  }
}

// Report.
if (warnings.length > 0) {
  console.log(`\ncheck-images: ${warnings.length} warning(s)`);
  for (const w of warnings) console.log(`  warn: ${w}`);
}

if (errors.length > 0) {
  console.error(`\ncheck-images: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  FAIL: ${e}`);
  process.exit(1);
}

console.log(`check-images: ${manifest.length} images OK (${domestic.length} domestic, ${international.length} international)`);
process.exit(0);
