"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** Current 1-based page index. */
  page: number;
  /** Total number of pages (must be >= 1). */
  totalPages: number;
  /** Called with the 1-based page to navigate to. */
  onPageChange: (page: number) => void;
  /** How many sibling pages to show on each side of the current page. */
  siblingCount?: number;
  className?: string;
}

function buildPages(page: number, totalPages: number, siblingCount: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages, page]);
  for (let i = 1; i <= siblingCount; i++) {
    if (page - i >= 1) pages.add(page - i);
    if (page + i <= totalPages) pages.add(page + i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

const squareClass =
  "tap-44 inline-flex items-center justify-center border border-line px-3 text-xs font-bold uppercase tracking-wide transition-colors";

/**
 * Brutalist square pagination. Client-only (handles clicks).
 *
 * @example
 * <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(page, 1), totalPages);
  const items = buildPages(current, totalPages, siblingCount);

  return (
    <nav aria-label="Pagination" className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
        className={cn(
          squareClass,
          "bg-paper shadow-hard-xs hover:bg-butter",
          current === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        <span className="ml-1 hidden sm:inline">Prev</span>
      </button>

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className={cn(squareClass, "border-transparent bg-transparent px-1 shadow-none")}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === current ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              squareClass,
              item === current
                ? "bg-lemon shadow-hard-xs"
                : "bg-paper shadow-hard-xs hover:bg-butter",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(current + 1)}
        disabled={current === totalPages}
        aria-label="Next page"
        className={cn(
          squareClass,
          "bg-paper shadow-hard-xs hover:bg-butter",
          current === totalPages && "pointer-events-none opacity-40",
        )}
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
