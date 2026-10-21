#!/usr/bin/env node
/**
 * Image prep gate — verifies every file listed in IMAGE_MANIFEST exists
 * on disk under public/images and is non-empty. Fails when a manifest
 * entry points at a missing or zero-byte file (e.g. after a partial
 * checkout or an accidental delete).
 *
 * Run: `node scripts/images-prep.mjs`
 */
import { statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "src", "lib", "image-manifest.ts");

if (!existsSync(MANIFEST_PATH)) {
  console.error("images-prep: image-manifest.ts not found — run `npm run images:scan` first");
  process.exit(1);
}

const raw = (await import("node:fs")).readFileSync(MANIFEST_PATH, "utf8");
const arrayMatch = raw.match(/IMAGE_MANIFEST\s*:[\s\S]*?=\s*(\[[\s\S]*?\])\s*as const/);
if (!arrayMatch) {
  console.error("images-prep: could not parse IMAGE_MANIFEST array");
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(arrayMatch[1]);
} catch {
  console.error("images-prep: failed to JSON.parse IMAGE_MANIFEST body");
  process.exit(1);
}

const errors = [];
let totalBytes = 0;

for (const img of manifest) {
  const filePath = join(ROOT, "public", img.url);
  if (!existsSync(filePath)) {
    errors.push(`Missing file: ${img.url}`);
    continue;
  }
  const st = statSync(filePath);
  if (st.size === 0) {
    errors.push(`Zero-byte file: ${img.url}`);
    continue;
  }
  totalBytes += st.size;
}

if (errors.length > 0) {
  console.error(`\nimages-prep: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  FAIL: ${e}`);
  process.exit(1);
}

const mb = (totalBytes / 1024 / 1024).toFixed(1);
console.log(`images-prep: ${manifest.length} files verified (${mb} MB total under public/images)`);
process.exit(0);
