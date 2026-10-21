#!/usr/bin/env node
/**
 * Validates that every image referenced by src/lib/domestic-destinations.ts
 * exists on disk under public/images/destinations with EXACTLY the same
 * casing, and prints the file size of each one.
 *
 * Vercel (Linux) is case-sensitive, so `JK1.jpg` and `jk1.jpg` are not
 * interchangeable — this gate fails the build when a name drifts.
 *
 * Run: `node scripts/validate-destination-images.mjs`
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  IMAGES_DIR,
  allReferencedFiles,
  parseDestinations,
} from "./lib/parse-destinations.mjs";

const destinations = parseDestinations();
const referenced = allReferencedFiles(destinations);

/** Case-insensitive index of the files that are actually on disk. */
const onDisk = existsSync(IMAGES_DIR) ? readdirSync(IMAGES_DIR) : [];
const lowerIndex = new Map();
for (const entry of onDisk) {
  const key = entry.toLowerCase();
  if (!lowerIndex.has(key)) lowerIndex.set(key, []);
  lowerIndex.get(key).push(entry);
}

const errors = [];
const rows = [];

for (const file of referenced) {
  const exact = join(IMAGES_DIR, file);

  if (existsSync(exact)) {
    const stat = statSync(exact);
    if (stat.size === 0) {
      errors.push(`Zero-byte file: ${file}`);
      continue;
    }
    rows.push({ file, kb: stat.size / 1024 });
    continue;
  }

  // Not found exactly — look for a casing-only difference.
  const candidates = lowerIndex.get(file.toLowerCase()) ?? [];
  if (candidates.length > 0) {
    errors.push(
      `Casing mismatch: "${file}" does not exist, but "${candidates.join('", "')}" does. ` +
        `Rename the file (or fix the reference) — Linux/Vercel is case-sensitive.`,
    );
  } else {
    errors.push(`Missing file: ${file} (expected public/images/destinations/${file})`);
  }
}

// Report
console.log(`\nvalidate-destination-images: ${referenced.length} file(s) across ${destinations.length} destinations\n`);
for (const row of rows) {
  console.log(`  OK  ${row.file.padEnd(20)} ${row.kb.toFixed(1).padStart(9)} KB`);
}

if (errors.length > 0) {
  console.error(`\nvalidate-destination-images: ${errors.length} error(s)\n`);
  for (const error of errors) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log(`\nvalidate-destination-images: all ${rows.length} file(s) present with exact casing.`);
process.exit(0);
