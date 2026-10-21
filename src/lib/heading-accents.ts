/**
 * Heading accent-word system.
 *
 * Markup convention: wrap the accent word in double brackets inside a
 * heading string — e.g. "The [[Himalayas]] are calling!". A single accent
 * word per heading. If no brackets are present, one word is auto-picked
 * deterministically: the longest word that is not a stopword; ties go to
 * the last one.
 */

const STOPWORDS = new Set([
  "a", "an", "the", "of", "to", "in", "on", "for", "and", "or",
  "is", "are", "your", "our", "with", "from", "at", "by",
]);

export type HeadingGradientTone =
  | "ink"
  | "ocean"
  | "flame"
  | "forest"
  | "plum"
  | "onDark"
  | "aurora"
  | "rose";

/** Strip bracket markup and return the display text. */
export function stripAccentSyntax(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, "$1");
}

/** Longest non-stopword; ties go to the last one. Fallback: last word. */
export function pickAccentIndex(words: string[]): number {
  let best = -1;
  let bestLen = 0;
  words.forEach((word, i) => {
    const clean = word.replace(/[^\p{L}\p{N}]/gu, "");
    if (STOPWORDS.has(clean.toLowerCase())) return;
    if (clean.length >= bestLen) {
      bestLen = clean.length;
      best = i;
    }
  });
  if (best === -1) return Math.max(0, words.length - 1);
  return best;
}

export type ParsedHeading = {
  /** Words with bracket markup removed (ready for rendering). */
  words: string[];
  /** Index of the accent word in `words`. */
  accentIndex: number;
};

/**
 * Parse a heading string into words + the single accent index.
 * Only the first `[[...]]` group is treated as the accent; any further
 * bracket groups are unwrapped to plain text.
 */
export function parseHeadingAccent(text: string): ParsedHeading {
  const match = text.match(/\[\[([^\]]+)\]\]/);
  if (match && match.index !== undefined) {
    const before = text.slice(0, match.index).trim();
    const after = text.slice(match.index + match[0].length).trim();
    const beforeWords = before ? before.split(/\s+/).filter(Boolean) : [];
    const accentWords = match[1].trim().split(/\s+/).filter(Boolean);
    const afterWords = after ? after.split(/\s+/).filter(Boolean) : [];
    const words = [...beforeWords, ...accentWords, ...afterWords];
    return { words, accentIndex: beforeWords.length };
  }
  const words = text.trim().split(/\s+/).filter(Boolean);
  return { words, accentIndex: pickAccentIndex(words) };
}
