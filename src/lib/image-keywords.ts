/**
 * Image classification keywords — maps filename substrings to
 * place regions and content tags. Used by scripts/images-scan.ts to
 * build the manifest. Folders under /public/images/domestic and
 * /public/images/international override filename matching.
 */

export type Region =
  | "himachal"
  | "uttarakhand"
  | "kashmir"
  | "ladakh"
  | "sikkim"
  | "rajasthan"
  | "kerala"
  | "goa"
  | "northeast"
  | "andaman"
  | "international";

export type ContentTag =
  | "mountain"
  | "trek"
  | "beach"
  | "heritage"
  | "city"
  | "spiritual"
  | "island"
  | "landscape";

/** Region keyword → region. Order matters: first match wins. */
export const REGION_KEYWORDS: ReadonlyArray<{ keyword: string; region: Region }> = [
  { keyword: "himachal", region: "himachal" },
  { keyword: "manali", region: "himachal" },
  { keyword: "shimla", region: "himachal" },
  { keyword: "spiti", region: "himachal" },
  { keyword: "kullu", region: "himachal" },
  { keyword: "kasol", region: "himachal" },
  { keyword: "dalhousie", region: "himachal" },
  { keyword: "dharamshala", region: "himachal" },
  { keyword: "kinnaur", region: "himachal" },

  { keyword: "uttarakhand", region: "uttarakhand" },
  { keyword: "utrakhand", region: "uttarakhand" }, // known misspelling in filenames
  { keyword: "rishikesh", region: "uttarakhand" },
  { keyword: "nainital", region: "uttarakhand" },
  { keyword: "mussoorie", region: "uttarakhand" },
  { keyword: "haridwar", region: "uttarakhand" },

  { keyword: "kashmir", region: "kashmir" },
  { keyword: "srinagar", region: "kashmir" },
  { keyword: "gulmarg", region: "kashmir" },
  { keyword: "pahalgam", region: "kashmir" },

  { keyword: "ladakh", region: "ladakh" },
  { keyword: "leh", region: "ladakh" },
  { keyword: "pangong", region: "ladakh" },
  { keyword: "nubra", region: "ladakh" },

  { keyword: "sikkim", region: "sikkim" },
  { keyword: "gangtok", region: "sikkim" },

  { keyword: "rajasthan", region: "rajasthan" },
  { keyword: "jaipur", region: "rajasthan" },
  { keyword: "udaipur", region: "rajasthan" },
  { keyword: "jaisalmer", region: "rajasthan" },
  { keyword: "jodhpur", region: "rajasthan" },

  { keyword: "kerala", region: "kerala" },
  { keyword: "munnar", region: "kerala" },
  { keyword: "alleppey", region: "kerala" },
  { keyword: "kochi", region: "kerala" },

  { keyword: "goa", region: "goa" },

  { keyword: "northeast", region: "northeast" },
  { keyword: "nort-east", region: "northeast" }, // known misspelling in filenames
  { keyword: "north-east", region: "northeast" },
  { keyword: "meghalaya", region: "northeast" },
  { keyword: "assam", region: "northeast" },
  { keyword: "arunachal", region: "northeast" },

  { keyword: "andaman", region: "andaman" },
  { keyword: "nicobar", region: "andaman" },
  { keyword: "havelock", region: "andaman" },
  { keyword: "portblair", region: "andaman" },
  { keyword: "neil", region: "andaman" },

  // International
  { keyword: "dubai", region: "international" },
  { keyword: "uae", region: "international" },
  { keyword: "nepal", region: "international" },
  { keyword: "kathmandu", region: "international" },
  { keyword: "pokhara", region: "international" },
  { keyword: "bhutan", region: "international" },
  { keyword: "paro", region: "international" },
  { keyword: "thimphu", region: "international" },
  { keyword: "myanmar", region: "international" },
  { keyword: "bagan", region: "international" },
  { keyword: "singapore", region: "international" },
  { keyword: "thailand", region: "international" },
  { keyword: "bali", region: "international" },
  { keyword: "malaysia", region: "international" },
];

/** Folder keyword → region. Checked before filename. */
export const FOLDER_KEYWORDS: ReadonlyArray<{ keyword: string; region: Region }> = [
  { keyword: "domestic", region: "himachal" }, // refined by filename
  { keyword: "india", region: "himachal" },
  { keyword: "international", region: "international" },
  { keyword: "foreign", region: "international" },
  { keyword: "forign", region: "international" },
  { keyword: "abroad", region: "international" },
];

/** Content tag keywords. */
export const TAG_KEYWORDS: ReadonlyArray<{ keyword: string; tag: ContentTag }> = [
  { keyword: "mountain", tag: "mountain" },
  { keyword: "hill", tag: "mountain" },
  { keyword: "peak", tag: "mountain" },
  { keyword: "snow", tag: "mountain" },
  { keyword: "trek", tag: "trek" },
  { keyword: "trail", tag: "trek" },
  { keyword: "beach", tag: "beach" },
  { keyword: "sand", tag: "beach" },
  { keyword: "shore", tag: "beach" },
  { keyword: "heritage", tag: "heritage" },
  { keyword: "fort", tag: "heritage" },
  { keyword: "palace", tag: "heritage" },
  { keyword: "temple", tag: "spiritual" },
  { keyword: "spiritual", tag: "spiritual" },
  { keyword: "monastery", tag: "spiritual" },
  { keyword: "gurudwara", tag: "spiritual" },
  { keyword: "city", tag: "city" },
  { keyword: "urban", tag: "city" },
  { keyword: "island", tag: "island" },
  { keyword: "landscape", tag: "landscape" },
  { keyword: "valley", tag: "landscape" },
  { keyword: "river", tag: "landscape" },
  { keyword: "lake", tag: "landscape" },
];

/** Classification result for a single file. */
export type Classification = {
  region: Region | "UNASSIGNED";
  tags: ContentTag[];
  isDomestic: boolean;
};

const DOMESTIC_REGIONS = new Set<Region>([
  "himachal", "uttarakhand", "kashmir", "ladakh", "sikkim",
  "rajasthan", "kerala", "goa", "northeast", "andaman",
]);

/**
 * Classify a file by its relative path (from /public/images/).
 * Filename match wins over folder; folder provides a default when
 * the filename has no region keyword. Unmatched → "UNASSIGNED".
 */
export function classifyImage(relPath: string): Classification {
  const lower = relPath.toLowerCase();
  const parts = lower.split(/[\\/]/);
  const filename = parts[parts.length - 1] ?? lower;

  // 1. Filename keyword
  let region: Region | null = null;
  for (const { keyword, region: r } of REGION_KEYWORDS) {
    if (filename.includes(keyword)) {
      region = r;
      break;
    }
  }

  // 2. Folder keyword fallback
  if (!region) {
    for (const { keyword, region: r } of FOLDER_KEYWORDS) {
      if (parts.some((p) => p.includes(keyword))) {
        region = r;
        break;
      }
    }
  }

  // 3. Unmatched → UNASSIGNED (generic slots only, never place-labeled)
  if (!region) {
    return { region: "UNASSIGNED", tags: [], isDomestic: false };
  }

  // Content tags
  const tags: ContentTag[] = [];
  for (const { keyword, tag } of TAG_KEYWORDS) {
    if (filename.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return {
    region,
    tags,
    isDomestic: DOMESTIC_REGIONS.has(region),
  };
}
