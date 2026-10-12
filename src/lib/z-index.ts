/**
 * The site's z-index ladder — single source of truth for stacking.
 *
 * Order (low → high):
 *
 *   content < sticky header < floating buttons < drawers/modals < cookie banner < toasts
 *
 * Anything that floats above page content must come from these exports rather
 * than an ad-hoc `z-*` utility, so new layers slot into the ladder instead of
 * fighting it. Numeric values are plain numbers: use them inline
 * (`style={{ zIndex: Z_FLOATING }}`) or in Tailwind arbitrary values
 * (`z-[45]`), keeping both in sync with this file.
 */
export const Z_CONTENT = 0;
export const Z_HEADER = 40;
export const Z_ACTION_BAR = 40;
export const Z_FLOATING = 45;
export const Z_DRAWER = 50;
export const Z_COOKIE = 60;
export const Z_TOAST = 70;

/**
 * CSS custom property published on `<html>` by the floating contact buttons:
 * `"1"` while they are suppressed (dialog open / field focused / admin route),
 * `"0"` while they are visible. Pure-CSS consumers can react to it without
 * touching React (e.g. `[style*="--tt-hide-floating: 1"] { … }`).
 */
export const HIDE_FLOATING_VAR = "--tt-hide-floating";
