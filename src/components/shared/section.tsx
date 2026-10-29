import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { AnimatedHeading } from "@/components/ui/animated-heading";
import type { HeadingGradientTone } from "@/lib/heading-accents";

type SectionTone =
  | "cream"
  | "paper"
  | "butter"
  | "mint"
  | "sky"
  | "peach"
  | "pink"
  | "lavender"
  | "sand"
  | "ink";

const toneClasses: Record<SectionTone, string> = {
  cream: "bg-cream",
  paper: "bg-paper",
  butter: "bg-butter",
  mint: "bg-mint",
  sky: "bg-sky",
  peach: "bg-peach",
  pink: "bg-pink",
  lavender: "bg-lavender",
  sand: "bg-sand",
  ink: "bg-ink text-cream",
};

type SectionWrapperProps = {
  children: React.ReactNode;
  tone?: SectionTone;
  id?: string;
  className?: string;
  containerClassName?: string;
  /** Adds the visible grid lines background (subtle). */
  gridLines?: boolean;
  bordered?: boolean;
  as?: "section" | "div" | "article" | "aside";
  "aria-labelledby"?: string;
};

/**
 * Every section gets its own light background color so sections are clearly
 * separated — the core of the neo-brutalist layout system.
 */
export function SectionWrapper({
  children,
  tone = "cream",
  id,
  className,
  containerClassName,
  gridLines = false,
  bordered = false,
  as: Tag = "section",
  ...props
}: SectionWrapperProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative w-full",
        toneClasses[tone],
        bordered && "border-y border-line",
        gridLines && "grid-lines",
        className,
      )}
      {...props}
    >
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}

/** Eyebrow label + big display heading used at the top of each section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
  className,
  tone = "cream",
  gradientTone = "ink",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
  tone?: "ink" | "cream";
  gradientTone?: HeadingGradientTone;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "label-brutal inline-flex w-fit items-center gap-2 border border-line bg-ink px-3 py-2 text-cream",
            tone === "cream" && "bg-lemon text-ink",
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2 id={id} className="max-w-[22ch] text-h2">
        {typeof title === "string" ? (
          <AnimatedHeading
            as="span"
            text={title}
            variant="section"
            hard={false}
            onDark={tone === "ink"}
            gradientTone={gradientTone}
            className="text-inherit"
          />
        ) : (
          <AnimatedHeading
            as="span"
            variant="section"
            hard={false}
            onDark={tone === "ink"}
            gradientTone={gradientTone}
            className="text-inherit"
          >
            {title}
          </AnimatedHeading>
        )}
      </h2>
      {description ? (
        <p className="max-w-2xl text-lead font-medium text-ink-soft">
          {description}
        </p>
      ) : null}
    </div>
  );
}
