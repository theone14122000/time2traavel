import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logoDark from "@/assets/brand/logo-mark.png";
import logoLight from "@/assets/brand/logo-mark-light.png";

/** Intrinsic ratio of the trimmed, transparent logo files (720 x 190). */
const LOGO_RATIO = 720 / 190;

/**
 * Brand logo — trimmed, transparent artwork so it sits cleanly on any surface.
 * Use `tone="light"` on dark backgrounds (white wordmark, teal accent kept).
 */
export function Logo({
  className,
  href = "/",
  height = 36,
  priority = false,
  tone = "dark",
  onClick,
}: {
  className?: string;
  href?: string | null;
  height?: number;
  priority?: boolean;
  tone?: "dark" | "light";
  onClick?: () => void;
}) {
  const width = Math.round(height * LOGO_RATIO);
  const mark = (
    <Image
      src={tone === "light" ? logoLight : logoDark}
      alt="Time to Travel"
      width={width}
      height={height}
      priority={priority}
      // Already a tiny (~8 KB), retina-sized bundled PNG: no optimiser needed.
      unoptimized
      className={cn("block h-auto w-auto select-none", className)}
      style={{ height, width: "auto" }}
    />
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center"
      aria-label="Time to Travel — home"
      onClick={onClick}
    >
      {mark}
    </Link>
  );
}
