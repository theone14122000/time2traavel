#!/usr/bin/env node
/**
 * Mojibake repair - rewrites text files that were saved with UTF-8 bytes
 * decoded as Windows-1252 (the classic "a-U+00E2-U+20AC-U+201D" instead of
 * an em dash).
 *
 * Each mojibake run is re-encoded to its original CP1252 bytes and decoded
 * again as UTF-8, which restores the intended character. Only runs that
 * decode cleanly are rewritten, so legitimate text is never touched.
 *
 * Run: `node scripts/fix-mojibake.mjs [--check]`
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_ONLY = process.argv.includes("--check");

/** CP1252 code points for 0x80-0x9F (the range that differs from Latin-1). */
const CP1252_HIGH = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
  [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
  [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
  [0x017e, 0x9e], [0x0178, 0x9f],
]);

function toBytes(text) {
  const bytes = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code <= 0x7f) {
      bytes.push(code);
    } else if (code <= 0xff) {
      bytes.push(code);
    } else if (CP1252_HIGH.has(code)) {
      // CP1252 punctuation (U+20AC, U+201C, ...) maps back to its byte.
      bytes.push(CP1252_HIGH.get(code));
    } else {
      return null;
    }
  }
  return bytes;
}

/**
 * A mojibake run: a lead byte (U+00C2 / U+00C3 / U+00E2) followed by one or
 * more CP1252 continuation characters.
 */
const MOJIBAKE_RUN = new RegExp(
  "[\\u00c2\\u00c3\\u00e2][\\u0080-\\u00bf\\u20ac\\u2018\\u2019\\u201a\\u201c" +
    "\\u201d\\u201e\\u2020\\u2021\\u2022\\u2026\\u2030\\u2039\\u203a\\u2122" +
    "\\u0152\\u0153\\u0160\\u0161\\u0178\\u017d\\u017e\\u02c6\\u02dc\\u0192" +
    "\\u0081\\u008d\\u008f\\u0090\\u009d\\u2014\\u2022\\u2030\\u2039\\u203a]+",
  "g",
);

const REPLACEMENT = /\ufffd/;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

function repair(text) {
  let changed = 0;
  const out = text.replace(MOJIBAKE_RUN, (run) => {
    const bytes = toBytes(run);
    if (!bytes) return run;
    let decoded;
    try {
      decoded = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
    } catch {
      return run;
    }
    // A repaired run must not contain replacement characters or controls.
    if (REPLACEMENT.test(decoded) || CONTROL.test(decoded)) return run;
    if (decoded === run) return run;
    changed += 1;
    return decoded;
  });
  return { out, changed };
}

const files = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .split("\n")
  .filter((file) => /\.(ts|tsx|mjs|js|json|css|md|html)$/.test(file));

let totalChanged = 0;
let totalRuns = 0;

for (const file of files) {
  const full = join(ROOT, file);
  let source;
  try {
    source = readFileSync(full, "utf8");
  } catch {
    continue;
  }
  if (!/[\u00c2\u00c3\u00e2]/.test(source)) continue;

  const { out, changed } = repair(source);
  if (changed === 0) continue;
  totalChanged += 1;
  totalRuns += changed;
  console.log(`  fixed ${changed} run(s)  ${file}`);
  if (!CHECK_ONLY) writeFileSync(full, out, "utf8");
}

console.log(
  `\nfix-mojibake: ${totalRuns} run(s) across ${totalChanged} file(s)` +
    (CHECK_ONLY ? " (check only - nothing written)" : ""),
);
process.exit(0);
