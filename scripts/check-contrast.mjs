#!/usr/bin/env node
/**
 * Contrast gate — fails the build when a sanctioned text/background pair
 * from src/app/globals.css drops below WCAG AA (4.5:1 normal, 3:1 large/UI).
 *
 * Reads the live :root tokens (single source of truth), so palette edits are
 * checked automatically. Run: `node scripts/check-contrast.mjs`
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = join(ROOT, "src", "app", "globals.css");

/* ---------------- tokens ---------------- */
const css = readFileSync(CSS_PATH, "utf8");
const rootMatch = css.match(/:root\s*\{([^}]*)\}/);
if (!rootMatch) {
  console.error("check-contrast: could not find a :root block in globals.css");
  process.exit(1);
}

const tokens = {};
for (const m of rootMatch[1].matchAll(/(--tt-[\w-]+)\s*:\s*(#\w{3,8})\s*;/g)) {
  tokens[m[1]] = m[2];
}

function token(name) {
  const v = tokens[name];
  if (!v) {
    console.error(`check-contrast: missing token ${name}`);
    process.exit(1);
  }
  return v;
}

/* ---------------- WCAG maths ---------------- */
const toRgb = (hex) => {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const int = parseInt(h, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};
const channel = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const luminance = (hex) => {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/* ---------------- sanctioned pairs ----------------
   Every text/background combination the design actually ships. */
const SECTION_TINTS = [
  "--tt-cream",
  "--tt-sunrise",
  "--tt-mint",
  "--tt-sky",
  "--tt-peach",
  "--tt-lavender",
  "--tt-blush",
  "--tt-sand",
];
const BRIGHT_FILLS = [
  "--tt-lemon",
  "--tt-tomato",
  "--tt-mint-strong",
  "--tt-sky-strong",
  "--tt-grape",
  "--tt-berry",
  "--tt-tangerine",
  "--tt-lime",
  "--tt-teal",
];

/** [foreground, background, minimum, context] */
const PAIRS = [
  // Body/headings on canvas + section backgrounds
  ...["--tt-cream", "--tt-paper"].flatMap((bg) => [
    ["--tt-ink", bg, 4.5, "ink on canvas"],
    ["--tt-ink-soft", bg, 4.5, "secondary on canvas"],
    ["--tt-pen-blue", bg, 4.5, "margin note on canvas"],
    ["--tt-stamp-red", bg, 4.5, "stamp on canvas"],
    ["--tt-pencil", bg, 4.5, "pencil on canvas"],
    ["--tt-danger", bg, 4.5, "error text on canvas"],
    ["--tt-success", bg, 4.5, "success text on canvas"],
  ]),
  ...SECTION_TINTS.flatMap((bg) => [
    ["--tt-ink", bg, 4.5, "ink on section tint"],
    ["--tt-ink-soft", bg, 4.5, "secondary on section tint"],
  ]),
  ...BRIGHT_FILLS.map((bg) => ["--tt-ink", bg, 4.5, "ink on bright fill"]),
  ["--tt-ink", "--tt-kraft", 4.5, "ink on kraft tape"],
  ["--tt-pen-blue", "--tt-kraft", 4.5, "pen note on kraft"],
  ["--tt-ink-soft", "--tt-kraft", 4.5, "secondary on kraft"],
  ["--tt-ink", "--tt-indigo-soft", 4.5, "ink on indigo tint"],

  // Dark surfaces (white text only on ink or indigo)
  ["--tt-cream", "--tt-ink", 4.5, "cream on ink"],
  ["--tt-paper", "--tt-ink", 4.5, "white on ink"],
  ["--tt-cream", "--tt-indigo", 4.5, "cream on indigo"],
  ["--tt-paper", "--tt-indigo", 4.5, "white on indigo"],

  // Solid controls
  ["--tt-paper", "--tt-danger", 4.5, "white on danger button"],
  ["--tt-paper", "--tt-success", 4.5, "white on success fill"],
  ["--tt-ink", "--tt-danger", 3.0, "ink on danger (large/UI)"],
];

/* ---------------- run ---------------- */
let failed = 0;
const rows = [];
for (const [fgVar, bgVar, min, context] of PAIRS) {
  const fg = token(fgVar);
  const bg = token(bgVar);
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed += 1;
  rows.push({
    ok,
    pair: `${fgVar.replace("--tt-", "")} on ${bgVar.replace("--tt-", "")}`,
    ratio: r.toFixed(2),
    min: min.toFixed(1),
    context,
  });
}

const w = Math.max(...rows.map((r) => r.pair.length));
for (const r of rows) {
  const mark = r.ok ? "PASS" : "FAIL";
  console.log(
    `${r.ok ? "✓" : "✗"} ${mark}  ${r.pair.padEnd(w)}  ${String(r.ratio).padStart(6)}:1  (min ${r.min})  ${r.context}`,
  );
}

if (failed > 0) {
  console.error(
    `\ncheck-contrast: ${failed} pair(s) below WCAG AA. Fix the tokens in src/app/globals.css.`,
  );
  process.exit(1);
}
console.log(
  `\ncheck-contrast: ${rows.length} pair(s) pass WCAG AA (4.5:1 text, 3:1 large/UI).`,
);
