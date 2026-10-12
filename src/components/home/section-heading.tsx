import * as React from "react";
import { RevealTitle } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

/**
 * Home-section eyebrow + masked slide-up display heading.
 * Same anatomy as the shared `SectionHeading`, but the title uses
 * `RevealTitle` (reduced-motion aware) per the home design system.
 */
export function HomeSectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "cream",
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** "ink" = heading sits on a dark band (cream text). */
  tone?: "cream" | "ink";
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
        <span
          className={cn(
            "label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink px-3 py-2 shadow-hard-xs",
            onDark
              ? "border-cream bg-tomato text-cream"
              : "bg-lemon text-ink",
          )}
        >
          {eyebrow}
        </span>
      ) : null}

      <div id={id}>
        <RevealTitle
          as="h2"
          onDark={onDark}
          className={cn(
            "max-w-[22ch] font-display text-h2 uppercase",
            onDark && "text-cream",
          )}
        >
          {title}
        </RevealTitle>
      </div>

      {description ? (
        <p
          className={cn(
            "max-w-2xl text-lead font-medium",
            onDark ? "text-cream/80" : "text-ink-soft",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
