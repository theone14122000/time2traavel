import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * TIME2TRAVEL wordmark — the distinctive brand mark.
 * The "2" is the hero glyph: coral block with a hard offset shadow,
 * sitting inline between TIME and TRAVEL. Works from 20px navbar
 * size up to large footer lockups.
 */
export function Wordmark({
  className,
  href = "/",
  size = "md",
  onDark = false,
  onClick,
}: {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  onClick?: () => void;
}) {
  const sizeClass =
    size === "sm"
      ? "text-base"
      : size === "lg"
        ? "text-2xl sm:text-3xl"
        : "text-lg sm:text-xl";

  const mark = (
    <span
      className={cn(
        "inline-flex select-none items-baseline font-display uppercase leading-none",
        sizeClass,
        onDark ? "text-cream" : "text-ink",
        className,
      )}
      aria-label="Time2Travel"
    >
      <span aria-hidden="true">TIME</span>
      <span
        aria-hidden="true"
        className="relative mx-[0.06em] inline-flex items-center justify-center bg-tomato px-[0.18em] py-[0.02em] text-ink shadow-hard-xs"
        style={{ transform: "rotate(-3deg)" }}
      >
        2
      </span>
      <span aria-hidden="true">TRAVEL</span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="shrink-0" aria-label="Time2Travel — home" onClick={onClick}>
      {mark}
    </Link>
  );
}
