import * as React from "react";
import { SectionHeading, SectionWrapper } from "@/components/shared/section";
import { cn } from "@/lib/utils";

type GalleryTone =
  | "cream"
  | "paper"
  | "butter"
  | "mint"
  | "sky"
  | "peach"
  | "sand";

/** Full-width gallery band: section heading + a stack of demo panels. */
export function GallerySection({
  id,
  eyebrow,
  title,
  description,
  tone = "cream",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: GalleryTone;
  children: React.ReactNode;
}) {
  return (
    <SectionWrapper tone={tone} bordered aria-labelledby={`${id}-heading`}>
      <div className="py-12 sm:py-16">
        <SectionHeading
          id={`${id}-heading`}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="mt-8 grid gap-6">{children}</div>
      </div>
    </SectionWrapper>
  );
}

/** Bordered demo panel with a dark ink caption bar. */
export function Panel({
  label,
  note,
  children,
  className,
  bodyClassName,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("border-[3px] border-ink bg-paper shadow-brutal-md", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b-[3px] border-ink bg-ink px-4 py-2.5">
        <span className="label-brutal text-cream">{label}</span>
        {note ? (
          <span className="label-brutal text-butter">{note}</span>
        ) : null}
      </div>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
