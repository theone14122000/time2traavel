import type { Config } from "tailwindcss";

/**
 * Design tokens mirror.
 *
 * Tailwind v4 is CSS-first: the source of truth lives in
 * `src/app/globals.css` (`:root` runtime vars + `@theme inline`).
 * This file is loaded via `@config` from that stylesheet and mirrors the
 * same tokens so editors/plugins and any legacy tooling stay in sync.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--tt-ink)",
        "ink-soft": "var(--tt-ink-soft)",
        paper: "var(--tt-paper)",
        cream: "var(--tt-cream)",
        // section palette (rotate — never repeat adjacent sections)
        sunrise: "var(--tt-sunrise)",
        butter: "var(--tt-sunrise)",
        mint: "var(--tt-mint)",
        sky: "var(--tt-sky)",
        peach: "var(--tt-peach)",
        lavender: "var(--tt-lavender)",
        blush: "var(--tt-blush)",
        pink: "var(--tt-blush)",
        sand: "var(--tt-sand)",
        // accents
        tomato: "var(--tt-tomato)",
        lemon: "var(--tt-lemon)",
        coral: "var(--tt-coral)",
        "mint-strong": "var(--tt-mint-strong)",
        "sky-strong": "var(--tt-sky-strong)",
        grape: "var(--tt-grape)",
        berry: "var(--tt-berry)",
        // semantic
        success: "var(--tt-success)",
        warning: "var(--tt-warning)",
        danger: "var(--tt-danger)",
      },
      boxShadow: {
        // canonical brutal scale: 3 / 6 / 10 px, hard offset, no blur
        "brutal-sm": "3px 3px 0 var(--tt-ink)",
        "brutal-md": "6px 6px 0 var(--tt-ink)",
        "brutal-lg": "10px 10px 0 var(--tt-ink)",
        // legacy names kept for compatibility
        "hard-xs": "2px 2px 0 var(--tt-ink)",
        "hard-sm": "4px 4px 0 var(--tt-ink)",
        hard: "6px 6px 0 var(--tt-ink)",
        "hard-lg": "10px 10px 0 var(--tt-ink)",
        "hard-xl": "16px 16px 0 var(--tt-ink)",
        "hard-2xl": "24px 24px 0 var(--tt-ink)",
        "hard-lemon": "6px 6px 0 var(--tt-lemon)",
        "hard-coral": "6px 6px 0 var(--tt-coral)",
        "hard-tomato": "6px 6px 0 var(--tt-tomato)",
      },
      borderRadius: {
        none: "0px",
        chip: "8px", // chips + inputs max radius
      },
      borderWidth: {
        sm2: "2px", // small elements
        card: "3px", // cards
        feature: "4px", // hero / feature blocks
      },
      fontFamily: {
        display: ["var(--font-bungee)", "Arial Black", "Helvetica Neue", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      spacing: {
        // 8px grid: components should snap to these
        18: "72px",
        22: "88px",
        30: "120px",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
