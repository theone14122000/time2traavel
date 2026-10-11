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
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
      )}
    >
      {eyebrow ? (
        <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2 text-ink shadow-hard-xs">
          {eyebrow}
        </span>
      ) : null}

      <div id={id}>
        <RevealTitle as="h2" className="max-w-[22ch] font-display text-h2 uppercase">
          {title}
        </RevealTitle>
      </div>

      {description ? (
        <p className="max-w-2xl text-lead font-medium text-ink-soft">{description}</p>
      ) : null}
    </div>
  );
}
