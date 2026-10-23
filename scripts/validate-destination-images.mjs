#!/usr/bin/env node
/**
 * Validates that every image referenced by the destination data sources
 * exists on disk under public/images/destinations with EXACTLY the same
 * casing, and prints the file size of each one.
 *
 * Covers:
 *   - domestic:  public/images/destinations/<file>
 *   - international: public/images/destinations/international/<file>
 *   - hero:      public/images/hero/slide-1.jpg ... slide-5.jpg
 *
 * Vercel (Linux) is case-sensitive, so a name drift fails the build.
 *
 * Run: `node scripts/validate-destination-images.mjs`
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  IMAGES_DIR,
  allReferencedFiles,
  parseDestinations,
} from "./lib/parse-destinations.mjs";

const ROOT = join(process.cwd());
const INTERNATIONAL_DIR = join(ROOT, "public", "images", "destinations", "international");
const HERO_DIR = join(ROOT, "public", "images", "hero");

// Domestic files (from domestic-destinations.ts)
const domesticDests = parseDestinations();
const domesticFiles = allReferencedFiles(domesticDests);

// International files (hard-coded per spec)
const INTERNATIONAL_DESTS = [
  { slug: "dubai", files: ["dubai1.jpg","dubai2.jpg","dubai3.jpg","dubai4.jpg"] },
  { slug: "nepal", files: ["nepal1.jpg","nepal2.jpg","nepal3.jpg","nepal4.jpg","nepal5.jpg"] },
  { slug: "bhutan", files: ["bhutan1.jpg","bhutan2.jpg","bhutan3.jpg","bhutan4.jpg","bhutan5.jpg","bhutan6.jpg"] },
  { slug: "singapore", files: ["singapore1.jpg","singapore2.jpg","singapore3.jpg","singapore4.jpg","singapore5.jpg"] },
  { slug: "sri-lanka", files: ["lanka1.jpg","lanka2.jpg","lanka3.jpg","lanka4.jpg","lanka5.jpg","lanka6.jpg"] },
];
const internationalFiles = INTERNATIONAL_DESTS.flatMap((d) => d.files);

// Hero files
const heroFiles = ["slide-1.jpg","slide-2.jpg","slide-3.jpg","slide-4.jpg","slide-5.jpg"];

const allFiles = [
  ...domesticFiles.map((f) => ({ scope: "domestic", file: f, dir: IMAGES_DIR })),
  ...internationalFiles.map((f) => ({ scope: "international", file: f, dir: INTERNATIONAL_DIR })),
  ...heroFiles.map((f) => ({ scope: "hero", file: f, dir: HERO_DIR })),
];

function caseExactCheck(dir, file) {
  if (!existsSync(dir)) return { ok: false, reason: "directory missing" };
  const entries = readdirSync(dir);
  const lowerIndex = new Map();
  for (const entry of entries) {
    const key = entry.toLowerCase();
    if (!lowerIndex.has(key)) lowerIndex.set(key, []);
    lowerIndex.get(key).push(entry);
  }
  const exact = join(dir, file);
  if (existsSync(exact)) {
    const stat = statSync(exact);
    if (stat.size === 0) return { ok: false, reason: "zero-byte file" };
    return { ok: true, size: stat.size };
  }
  const candidates = lowerIndex.get(file.toLowerCase()) ?? [];
  if (candidates.length > 0) {
    return { ok: false, reason: `casing mismatch: "${file}" vs "${candidates.join('", "')}"` };
  }
  return { ok: false, reason: `missing file` };
}

let errors = 0;
let total = 0;
const scopes = { domestic: 0, international: 0, hero: 0 };

for (const { scope, file, dir } of allFiles) {
  const result = caseExactCheck(dir, file);
  if (!result.ok) {
    console.error(`  FAIL  [${scope}] ${file}: ${result.reason}`);
    errors++;
  } else {
    const kb = (result.size / 1024).toFixed(1);
    console.log(`  OK  [${scope}] ${file.padEnd(20)} ${kb.padStart(9)} KB`);
    total++;
    scopes[scope]++;
  }
}

console.log(`\nvalidate-destination-images: ${total} file(s) OK (domestic ${scopes.domestic}, international ${scopes.international}, hero ${scopes.hero})`);
if (errors > 0) {
  console.error(`validate-destination-images: ${errors} error(s)`);
  process.exit(1);
}
console.log("validate-destination-images: all files present with exact casing.");
process.exit(0);
