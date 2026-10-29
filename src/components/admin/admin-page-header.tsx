import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared page header for every admin screen. */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border border-line bg-butter p-4 shadow-hard sm:p-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow ? (
          <span className="label-brutal w-fit border border-line bg-ink px-2 py-1 text-cream">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-display text-h3 uppercase leading-none">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm font-medium text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
