import * as React from "react";
import { RevealTitle } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

/**
 * Home-section eyebrow + comic display heading.
 * Optional `panelWords` wraps the final N words in a solid comic panel
 * (one clear focal point per heading — never every word).
 */
export function HomeSectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "cream",
  panelWords = 0,
  panelTone = "tomato",
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** "ink" = heading sits on a dark band (cream text). */
  tone?: "cream" | "ink";
  /** Wrap the last N words of a string title in a comic panel (0 = off). */
  panelWords?: number;
  panelTone?: "tomato" | "mint" | "lemon" | "sky" | "paper" | "peach";
}) {
  const onDark = tone === "ink";

  const headingNode =
    panelWords > 0 && typeof title === "string"
      ? renderPanelTitle(title, panelWords, panelTone)
      : title;

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
              ? "border-cream bg-tomato text-ink"
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
            "max-w-[22ch] text-h2",
            onDark && "text-cream",
          )}
        >
          {headingNode}
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

/** Split a string title so the last `count` words sit in a comic panel. */
function renderPanelTitle(
  title: string,
  count: number,
  panelTone: "tomato" | "mint" | "lemon" | "sky" | "paper" | "peach",
) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= count) {
    return (
      <span className={cn("comic-panel", `comic-panel-${panelTone}`)}>
        {words.join(" ")}
      </span>
    );
  }
  const cut = words.length - count;
  const head = words.slice(0, cut).join(" ");
  const tail = words.slice(cut).join(" ");
  return (
    <>
      {head}{" "}
      <span className={cn("comic-panel", `comic-panel-${panelTone}`)}>
        {tail}
      </span>
    </>
  );
}
