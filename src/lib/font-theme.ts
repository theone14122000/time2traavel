/**
 * Font theme pairing — admin setting (`SiteSettings.fontTheme`).
 *
 * Theme A "Journal"       — Kaushan Script / Caveat Brush / Nunito (default)
 * Theme B "Retro Postcard" — Pacifico / Caveat / Nunito
 * Theme C "Elegant"        — Yellowtail / Fraunces italic / Inter
 *
 * The rendered class re-points the `--tt-font-script/hand/body` role vars
 * in globals.css, so every `font-*` utility follows the active theme.
 */
export const FONT_THEMES = ["JOURNAL", "RETRO", "ELEGANT"] as const;

export type FontTheme = (typeof FONT_THEMES)[number];

export const DEFAULT_FONT_THEME: FontTheme = "JOURNAL";

export const FONT_THEME_LABELS: Record<FontTheme, string> = {
  JOURNAL: "Journal — Kaushan Script + Caveat Brush + Nunito",
  RETRO: "Retro Postcard — Pacifico + Caveat + Nunito",
  ELEGANT: "Elegant — Yellowtail + Fraunces italic + Inter",
};

/** Narrow an unknown stored value to a known theme (falls back to Journal). */
export function parseFontTheme(value: unknown): FontTheme {
  return FONT_THEMES.includes(value as FontTheme)
    ? (value as FontTheme)
    : DEFAULT_FONT_THEME;
}

/** Class applied to <html> that re-points the font role variables. */
export function fontThemeClass(theme: FontTheme): string {
  return `font-theme-${theme.toLowerCase()}`;
}
