import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Brutalist breadcrumb trail: square chips with → separators, last chip
 * highlighted in lemon and marked `aria-current="page"`.
 *
 * Server-safe (no hooks) — usable directly inside async server components.
 * Horizontally scrollable on small screens without a visible scrollbar.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const trail = (items ?? []).filter((item) => item.label?.trim().length);

  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full overflow-x-auto no-scrollbar", className)}>
      <ol className="flex w-fit items-center gap-1.5 py-1">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1.5">
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="label-brutal border-[2px] border-ink bg-paper px-2.5 py-1.5 transition-colors hover:bg-butter"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "label-brutal border-[2px] border-ink bg-paper px-2.5 py-1.5",
                    isLast && "bg-lemon",
                  )}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span aria-hidden="true" className="font-display text-sm leading-none">
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
