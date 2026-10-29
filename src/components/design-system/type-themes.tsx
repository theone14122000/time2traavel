"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { contrastRatio, passesAA, ratioLabel } from "@/lib/color";
import {
  FONT_THEMES,
  FONT_THEME_LABELS,
  fontThemeClass,
  type FontTheme,
} from "@/lib/font-theme";

/* ---------------------------------------------------------------
   Type tab — all three font themes live, every role size, on every
   section background, with real WCAG ratios read from :root tokens.
   --------------------------------------------------------------- */

type TokenMap = Record<string, string>;

const ROLE_SAMPLES: {
  role: string;
  spec: string;
  cls: string;
  sample: string;
}[] = [
  {
    role: "Script H1",
    spec: "clamp(2.75rem, 11vw, 6rem) · line-height 1.16",
    cls: "font-script text-h1",
    sample: "Your next trip starts here.",
  },
  {
    role: "Script H2",
    spec: "clamp(2.5rem, 7vw, 4rem) · 40px floor",
    cls: "font-script text-h2",
    sample: "Section heading",
  },
  {
    role: "Handwritten H3",
    spec: "clamp(1.5rem, 4.5vw, 2.25rem)",
    cls: "font-hand text-h3",
    sample: "Card and sub-section",
  },
  {
    role: "Handwritten H4",
    spec: "clamp(1.15rem, 2vw + 0.75rem, 1.6rem)",
    cls: "font-hand text-h4",
    sample: "Small card heading",
  },
  {
    role: "Margin note",
    spec: "clamp(1.125rem, 3vw, 1.5rem)",
    cls: "font-hand text-note text-pen-blue",
    sample: "psst, ask us anything",
  },
  {
    role: "Body",
    spec: "17px · line-height 1.65 · max 65ch",
    cls: "measure",
    sample:
      "Journal body copy at 17px with a comfortable 1.65 line height, kept to a 65-character measure so paragraphs stay easy to read on paper.",
  },
  {
    role: "Label / eyebrow",
    spec: "14px floor · handwritten",
    cls: "label-brutal border border-line bg-lemon px-2.5 py-1.5",
    sample: "Choose your next quest",
  },
];

const BACKGROUNDS: { token: string; label: string; dark?: boolean }[] = [
  { token: "--tt-cream", label: "paper cream" },
  { token: "--tt-paper", label: "page white" },
  { token: "--tt-sunrise", label: "sunshine" },
  { token: "--tt-sky", label: "sky" },
  { token: "--tt-mint", label: "mint" },
  { token: "--tt-peach", label: "coral" },
  { token: "--tt-lavender", label: "grape" },
  { token: "--tt-blush", label: "pink" },
  { token: "--tt-sand", label: "tangerine" },
  { token: "--tt-lemon", label: "lemon fill" },
  { token: "--tt-tomato", label: "coral fill" },
  { token: "--tt-mint-strong", label: "mint fill" },
  { token: "--tt-sky-strong", label: "sky fill" },
  { token: "--tt-kraft", label: "kraft tape" },
  { token: "--tt-indigo", label: "indigo", dark: true },
  { token: "--tt-ink", label: "ink", dark: true },
];

function readTokens(names: string[]): TokenMap {
  const styles = getComputedStyle(document.documentElement);
  const out: TokenMap = {};
  for (const name of names) {
    out[name] = styles.getPropertyValue(name).trim();
  }
  return out;
}

function activeTheme(): FontTheme | null {
  const cls = document.documentElement.className;
  const found = FONT_THEMES.find((t) =>
    cls.includes(`font-theme-${t.toLowerCase()}`),
  );
  return found ?? null;
}

export function TypeThemes() {
  const [tokens, setTokens] = React.useState<TokenMap | null>(null);
  const [active, setActive] = React.useState<FontTheme | null>(null);

  React.useEffect(() => {
    setTokens(readTokens(BACKGROUNDS.map((b) => b.token)));
    setActive(activeTheme());
  }, []);

  return (
    <div className="grid gap-6">
      <p className="text-sm font-medium text-ink-soft">
        {active ? (
          <>
            Active pairing:{" "}
            <span className="font-semibold text-ink">
              {FONT_THEME_LABELS[active]}
            </span>{" "}
            — switch it in Site settings → Typography (or set it back here for
            a preview).
          </>
        ) : (
          "Live rendering below — the active pairing is read from the page itself."
        )}
      </p>

      {/* ---- All three themes, live ---- */}
      <div className="grid gap-5">
        {FONT_THEMES.map((theme) => (
          <section
            key={theme}
            className={cn(
              "border border-line bg-paper shadow-hard-xs",
              fontThemeClass(theme),
              active === theme && "shadow-hard",
            )}
            aria-label={FONT_THEME_LABELS[theme]}
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-lavender px-4 py-2.5">
              <span className="label-brutal">{FONT_THEME_LABELS[theme]}</span>
              <span className="label-brutal border border-line bg-paper px-2 py-1">
                {active === theme ? "Active now" : `Theme ${theme[0]}`}
              </span>
            </header>
            <div className="grid gap-0">
              {ROLE_SAMPLES.map((row, i) => (
                <div
                  key={row.role}
                  className={cn(
                    "grid gap-2 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4",
                    i > 0 && "border-t border-line",
                  )}
                >
                  <div className="grid gap-0.5">
                    <span className="label-brutal text-ink-soft">
                      {row.role}
                    </span>
                    <code className="text-xs font-bold text-pencil">
                      {row.spec}
                    </code>
                  </div>
                  <p className={cn("min-w-0 break-words", row.cls)}>
                    {row.sample}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ---- Ink on every section background, with ratios ---- */}
      <section className="border border-line bg-paper shadow-hard-xs">
        <header className="border-b border-line bg-lemon px-4 py-2.5">
          <span className="label-brutal">
            Contrast — ink on every section fill (AA 4.5:1)
          </span>
        </header>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
          {BACKGROUNDS.map(({ token, label, dark }) => {
            const bg = tokens?.[token] ?? "";
            const fg = dark ? tokens?.["--tt-cream"] : tokens?.["--tt-ink"];
            const ratio = bg && fg ? contrastRatio(fg, bg) : 0;
            const ok = passesAA(ratio);
            return (
              <div
                key={token}
                className="grid gap-2 border border-line p-3"
                style={{ backgroundColor: bg || undefined }}
              >
                <span
                  className="label-brutal"
                  style={{ color: fg || undefined }}
                >
                  {label}
                </span>
                <p
                  className="font-hand text-xl leading-tight"
                  style={{ color: fg || undefined }}
                >
                  Handwriting sample
                </p>
                <p
                  className="text-sm leading-snug"
                  style={{ color: fg || undefined }}
                >
                  Body copy stays readable.
                </p>
                <span
                  className={cn(
                    "label-brutal w-fit border px-1.5 py-0.5 text-xs",
                    ok
                      ? "border-line bg-paper text-success"
                      : "border-line bg-paper text-danger",
                  )}
                >
                  {ratio ? `${ratioLabel(ratio)} ${ok ? "AA pass" : "FAIL"}` : "…"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
