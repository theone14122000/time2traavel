#!/usr/bin/env node
/**
 * Image library scan — walks /public/images, classifies each file
 * via src/lib/image-keywords.ts (inlined for Node), and writes:
 *   - src/lib/image-manifest.ts  (generated — do not edit by hand)
 *   - images-report.md            (human-readable audit)
 *
 * Run: npm run images:scan
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = join(ROOT, "public", "images");
const MANIFEST_PATH = join(ROOT, "src", "lib", "image-manifest.ts");
const REPORT_PATH = join(ROOT, "images-report.md");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif"]);

/** Folders that hold generated derivatives, not source photography. */
const DERIVED_FOLDERS = new Set(["thumbs"]);

/* ---------------- classification (inlined from image-keywords.ts) ---------------- */
const REGION_KEYWORDS = [
  ["himachal", "himachal"], ["manali", "himachal"], ["shimla", "himachal"],
  ["spiti", "himachal"], ["kullu", "himachal"], ["kasol", "himachal"],
  ["dalhousie", "himachal"], ["dharamshala", "himachal"], ["kinnaur", "himachal"],
  ["uttarakhand", "uttarakhand"], ["utrakhand", "uttarakhand"],
  ["rishikesh", "uttarakhand"], ["nainital", "uttarakhand"],
  ["mussoorie", "uttarakhand"], ["haridwar", "uttarakhand"],
  ["kashmir", "kashmir"], ["srinagar", "kashmir"], ["gulmarg", "kashmir"], ["pahalgam", "kashmir"],
  ["ladakh", "ladakh"], ["leh", "ladakh"], ["pangong", "ladakh"], ["nubra", "ladakh"],
  ["sikkim", "sikkim"], ["gangtok", "sikkim"],
  ["rajasthan", "rajasthan"], ["jaipur", "rajasthan"], ["udaipur", "rajasthan"],
  ["jaisalmer", "rajasthan"], ["jodhpur", "rajasthan"],
  ["kerala", "kerala"], ["munnar", "kerala"], ["alleppey", "kerala"], ["kochi", "kerala"],
  ["goa", "goa"],
  ["northeast", "northeast"], ["nort-east", "northeast"], ["north-east", "northeast"],
  ["meghalaya", "northeast"], ["assam", "northeast"], ["arunachal", "northeast"],
  ["andaman", "andaman"], ["nicobar", "andaman"], ["havelock", "andaman"],
  ["portblair", "andaman"], ["neil", "andaman"],
  ["dubai", "international"], ["uae", "international"],
  ["nepal", "international"], ["kathmandu", "international"], ["pokhara", "international"],
  ["bhutan", "international"], ["paro", "international"], ["thimphu", "international"],
  ["myanmar", "international"], ["bagan", "international"],
  ["singapore", "international"], ["thailand", "international"],
  ["bali", "international"], ["malaysia", "international"],
];

/**
 * Exact filename-stem prefixes that must win over the generic keyword scan
 * (the destination library uses short stems like "JK1" or "UP2").
 */
const PREFIX_REGIONS = [
  ["jk", "kashmir"],
  ["up", "uttarpradesh"],
  ["gujrat", "gujarat"],
  ["rajisthan", "rajasthan"],
  ["tamil", "tamilnadu"],
  ["assam", "northeast"],
  ["himachal", "himachal"],
  ["utrakhand", "uttarakhand"],
  ["uttarakhand", "uttarakhand"],
];
const FOLDER_KEYWORDS = [
  ["domestic", "himachal"], ["india", "himachal"],
  ["international", "international"], ["foreign", "international"],
  ["forign", "international"], ["abroad", "international"],
];
const TAG_KEYWORDS = [
  ["mountain", "mountain"], ["hill", "mountain"], ["peak", "mountain"], ["snow", "mountain"],
  ["trek", "trek"], ["trail", "trek"],
  ["beach", "beach"], ["sand", "beach"], ["shore", "beach"],
  ["heritage", "heritage"], ["fort", "heritage"], ["palace", "heritage"],
  ["temple", "spiritual"], ["spiritual", "spiritual"], ["monastery", "spiritual"], ["gurudwara", "spiritual"],
  ["city", "city"], ["urban", "city"],
  ["island", "island"],
  ["landscape", "landscape"], ["valley", "landscape"], ["river", "landscape"], ["lake", "landscape"],
];
const DOMESTIC = new Set([
  "himachal","uttarakhand","kashmir","ladakh","sikkim","rajasthan",
  "kerala","goa","northeast","andaman","gujarat","tamilnadu","uttarpradesh",
]);

/** Human-readable region names used for the alt suggestion. */
const REGION_LABELS = {
  himachal: "Himachal Pradesh",
  uttarakhand: "Uttarakhand",
  kashmir: "Jammu & Kashmir",
  ladakh: "Ladakh",
  sikkim: "Sikkim",
  rajasthan: "Rajasthan",
  kerala: "Kerala",
  goa: "Goa",
  northeast: "Northeast India",
  andaman: "Andaman & Nicobar",
  gujarat: "Gujarat",
  tamilnadu: "Tamil Nadu",
  uttarpradesh: "Uttar Pradesh",
  international: "International",
  UNASSIGNED: "On the road",
};

function classify(relPath) {
  const lower = relPath.toLowerCase().replace(/\\/g, "/");
  const parts = lower.split("/");
  const filename = parts[parts.length - 1] ?? lower;
  const stem = filename.replace(/\.[^.]+$/, "");

  let region = null;
  // 1. Exact stem prefix wins (JK1, UP2, gujrat3, ...).
  for (const [prefix, r] of PREFIX_REGIONS) {
    if (stem === prefix || stem.startsWith(prefix)) { region = r; break; }
  }
  // 2. Generic filename keyword.
  if (!region) {
    for (const [kw, r] of REGION_KEYWORDS) { if (filename.includes(kw)) { region = r; break; } }
  }
  // 3. Folder keyword.
  if (!region) {
    for (const [kw, r] of FOLDER_KEYWORDS) { if (parts.some(p => p.includes(kw))) { region = r; break; } }
  }
  if (!region) {
    if (parts.some(p => p.includes("international") || p.includes("foreign"))) region = "international";
    else region = "UNASSIGNED";
  }
  const tags = [];
  for (const [kw, tag] of TAG_KEYWORDS) { if (filename.includes(kw) && !tags.includes(tag)) tags.push(tag); }
  return { region, tags, isDomestic: DOMESTIC.has(region) };
}

/* ---------------- walk ---------------- */
function walk(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (DERIVED_FOLDERS.has(entry.name)) continue;
      walk(full, acc);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    try {
      const st = statSync(full);
      acc.push({ full, rel: relative(IMAGES_DIR, full).replace(/\\/g, "/"), bytes: st.size });
    } catch { /* skip unreadable */ }
  }
  return acc;
}

/* ---------------- run ---------------- */
const files = walk(IMAGES_DIR);
const manifest = files.map(({ rel, bytes }) => {
  const { region, tags, isDomestic } = classify(rel);
  const url = `/images/${rel}`;
  const base = rel.replace(/\.[^.]+$/, "");
  // Human-readable alt suggestion: the file stem without the folder and
  // without the trailing index ("destinations/JK3" -> "Jammu & Kashmir").
  const stem = base.split("/").pop() ?? base;
  const label = REGION_LABELS[region] ?? "Travel";
  const suggested =
    region === "UNASSIGNED"
      ? stem.replace(/[-_]+/g, " ").trim() || base
      : label;
  return {
    url,
    filename: rel,
    bytes,
    region,
    tags,
    isDomestic,
    suggestedAlt: suggested,
  };
});

/* Group by region for the report */
const byRegion = {};
for (const item of manifest) {
  const key = item.region;
  if (!byRegion[key]) byRegion[key] = [];
  byRegion[key].push(item);
}
const unassigned = byRegion["UNASSIGNED"] ?? [];

/* Write manifest */
const ALL_REGIONS = ["himachal","uttarakhand","kashmir","ladakh","sikkim","rajasthan","kerala","goa","northeast","andaman","gujarat","tamilnadu","uttarpradesh","international","UNASSIGNED"];
const regionCounts = {};
for (const r of ALL_REGIONS) regionCounts[r] = (byRegion[r] ?? []).length;

const ts = `// AUTO-GENERATED by scripts/images-scan.ts — do not edit by hand.
// Run \`npm run images:scan\` to regenerate.
export type ManifestRegion =
  | "himachal" | "uttarakhand" | "kashmir" | "ladakh" | "sikkim"
  | "rajasthan" | "kerala" | "goa" | "northeast" | "andaman"
  | "gujarat" | "tamilnadu" | "uttarpradesh"
  | "international" | "UNASSIGNED";

export type ManifestTag =
  | "mountain" | "trek" | "beach" | "heritage" | "city"
  | "spiritual" | "island" | "landscape";

export type ImageManifestEntry = {
  url: string;
  filename: string;
  bytes: number;
  region: ManifestRegion;
  tags: ManifestTag[];
  isDomestic: boolean;
  suggestedAlt: string;
};

export const IMAGE_MANIFEST: readonly ImageManifestEntry[] = ${JSON.stringify(manifest, null, 2)} as const;

export const REGION_COUNTS: Record<ManifestRegion, number> = ${JSON.stringify(regionCounts, null, 2)} as const;
`;
writeFileSync(MANIFEST_PATH, ts, "utf8");

/* Write report */
let md = `# Image Library Scan Report\n\n`;
md += `**Generated:** ${new Date().toISOString()}\n`;
md += `**Total images:** ${manifest.length}\n\n`;
md += `## Region breakdown\n\n`;
md += `| Region | Count | Domestic |\n|--------|-------|----------|\n`;
for (const [region, items] of Object.entries(byRegion).sort((a, b) => b[1].length - a[1].length)) {
  md += `| ${region} | ${items.length} | ${region !== "international" && region !== "UNASSIGNED" ? "yes" : "no"} |\n`;
}
md += `\n## Unassigned images (no region keyword matched)\n\n`;
if (unassigned.length === 0) {
  md += `None — every image matched a region keyword.\n`;
} else {
  for (const item of unassigned) md += `- \`${item.filename}\` (${(item.bytes / 1024).toFixed(0)} KB)\n`;
}
md += `\n## All images\n\n`;
md += `| Filename | Region | Tags | Domestic | Alt suggestion |\n|----------|--------|------|----------|----------------|\n`;
for (const item of manifest) {
  md += `| \`${item.filename}\` | ${item.region} | ${item.tags.join(", ") || "—"} | ${item.isDomestic ? "yes" : "no"} | ${item.suggestedAlt} |\n`;
}
writeFileSync(REPORT_PATH, md, "utf8");

console.log(`images-scan: ${manifest.length} images scanned.`);
console.log(`  manifest → src/lib/image-manifest.ts`);
console.log(`  report   → images-report.md`);
if (unassigned.length > 0) {
  console.log(`  ⚠ ${unassigned.length} image(s) unassigned — review images-report.md`);
}
