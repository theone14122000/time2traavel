import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type DividerVariant = "zigzag" | "torn" | "stripe" | "thick";
export type DividerTone = "ink" | "lemon" | "tomato" | "paper" | "sky" | "mint";

const toneBackground: Record<DividerTone, string> = {
  ink: "bg-ink",
  lemon: "bg-lemon",
  tomato: "bg-tomato",
  paper: "bg-paper",
  sky: "bg-sky",
  mint: "bg-mint",
};

const toneFill: Record<DividerTone, string> = {
  ink: "var(--tt-ink)",
  lemon: "var(--tt-lemon)",
  tomato: "var(--tt-tomato)",
  paper: "var(--tt-paper)",
  sky: "var(--tt-sky)",
  mint: "var(--tt-mint)",
};

/** Repeating triangles rising from the baseline. */
const ZIGZAG_PATH = "M0 24 L12 0 L24 24 L36 0 L48 24 L60 0 L72 24 L84 0 L96 24 Z";

/** Irregular jagged edge — hand-torn paper feel. */
const TORN_PATH =
  "M0 15 L6 6 L13 14 L21 4 L28 12 L35 7 L44 16 L52 5 L59 13 L67 8 L75 17 L83 6 L90 13 L96 9 L96 24 L0 24 Z";

/**
 * Server-safe presentational section separators.
 * Always decorative: `aria-hidden` + block-level between sections.
 */
export function SectionDivider({
  variant,
  tone = "ink",
  flip = false,
  className,
}: {
  variant: DividerVariant;
  tone?: DividerTone;
  /** Mirrors the shape vertically (for stacked/touching bands). */
  flip?: boolean;
  className?: string;
}) {
  const flipClass = flip ? "-scale-y-100" : undefined;

  if (variant === "stripe") {
    // `.divider-stripe` paints ink diagonals; on an ink tone swap in paper
    // stripes so the band stays visible.
    const stripeStyle =
      tone === "ink"
        ? ({
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--tt-paper) 0 12px, transparent 12px 26px)",
          } satisfies CSSProperties)
        : undefined;

    return (
      <div
        aria-hidden="true"
        style={stripeStyle}
        className={cn("divider-stripe block h-5 w-full", toneBackground[tone], flipClass, className)}
      />
    );
  }

  if (variant === "thick") {
    return (
      <div
        aria-hidden="true"
        className={cn("block h-3 w-full sm:h-4", toneBackground[tone], flipClass, className)}
      />
    );
  }

  const path = variant === "zigzag" ? ZIGZAG_PATH : TORN_PATH;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 96 24"
      preserveAspectRatio="none"
      className={cn("block h-6 w-full sm:h-8", flipClass, className)}
    >
      <path d={path} fill={toneFill[tone]} />
    </svg>
  );
}
