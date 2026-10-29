import * as React from "react";
import { RevealTitle } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import type { HeadingGradientTone } from "@/lib/heading-accents";

/**
 * Home-section eyebrow + display heading with exactly one gradient accent word.
 * No panel backgrounds behind words — GradientWord handles the accent.
 */
export function HomeSectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "cream",
  gradientTone = "ink",
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** "ink" = heading sits on a dark band (cream text). */
  tone?: "cream" | "ink";
  /** Gradient tone for the accent word. */
  gradientTone?: HeadingGradientTone;
}) {
  const onDark = tone === "ink";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
      )}
    >
      {eyebrow ? (
        <span className={cn("lux-eyebrow", onDark && "text-[#e6cf9f]")}>{eyebrow}</span>
      ) : null}

      <div id={id}>
        <RevealTitle
          as="h2"
          onDark={onDark}
          gradientTone={gradientTone}
          className={cn(
            "max-w-[22ch] text-h2",
            onDark && "text-cream",
          )}
        >
          {title}
        </RevealTitle>
      </div>

      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed font-medium sm:text-lead",
            onDark ? "text-cream/80" : "text-ink-soft",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
