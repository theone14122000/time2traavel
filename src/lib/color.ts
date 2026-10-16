/**
 * WCAG contrast helpers (client-safe, pure math) used by the
 * /design-system Type tab to show live AA ratios for each theme.
 * The build-time gate lives in scripts/check-contrast.mjs (parses globals.css).
 */

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** "#16141f" | "16141f" | "#abc" → [r, g, b] 0-255 */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const int = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(int)) return [0, 0, 0];
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** WCAG relative luminance 0–1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio 1–21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** AA pass: 4.5 normal text, 3.0 large text (≥24px or 19px bold). */
export function passesAA(ratio: number, large = false): boolean {
  return ratio >= (large ? 3 : 4.5);
}

/** "5.32:1" style label, rounded to 2 decimals. */
export function ratioLabel(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
