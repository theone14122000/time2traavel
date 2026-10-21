import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { renderHeading } from "@/lib/render-heading";
import type { HeadingGradientTone } from "@/lib/heading-accents";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  tone = "butter",
  gradientTone = "ink",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "butter" | "mint" | "sky" | "peach" | "lavender" | "cream" | "ink";
  gradientTone?: HeadingGradientTone;
  className?: string;
}) {
  const toneClasses = {
    butter: "bg-butter",
    mint: "bg-mint",
    sky: "bg-sky",
    peach: "bg-peach",
    lavender: "bg-lavender",
    cream: "bg-cream",
    ink: "bg-ink text-cream",
  } as const;

  return (
    <header
      className={cn(
        "relative w-full border-b-[3px] border-ink",
        toneClasses[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
      <Container className="relative py-10 sm:py-14 lg:py-20">
        <div className="flex flex-col gap-4">
          {eyebrow ? (
            <span className="label-brutal w-fit border-[3px] border-ink bg-ink px-3 py-2 text-cream">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="max-w-[16ch] text-h1">
            {typeof title === "string" ? renderHeading(title, gradientTone) : title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-lead font-medium text-ink-soft">{description}</p>
          ) : null}
          {children ? <div className="mt-2 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </Container>
    </header>
  );
}
