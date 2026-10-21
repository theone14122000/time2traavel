"use client";

import * as React from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HeadingGradientTone } from "@/lib/heading-accents";

/**
 * GradientWord — an inline span carrying an animated gradient fill.
 * Never inline-block so it wraps naturally inside headings.
 * The animation runs only while the word is in view (data-animate)
 * and is static under prefers-reduced-motion / forced-colors / print.
 */
export function GradientWord({
  children,
  tone = "ink",
  className,
}: {
  children: React.ReactNode;
  tone?: HeadingGradientTone;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });

  return (
    <span
      ref={ref}
      className={cn("hg-word", `hg-${tone}`, className)}
      data-animate={inView ? "true" : "false"}
    >
      {children}
    </span>
  );
}
