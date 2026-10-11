"use client";

import * as React from "react";
import { Pagination } from "@/components/ui/pagination";

/** Stateful pagination — page 1 of 12. */
export function PaginationDemo() {
  const [page, setPage] = React.useState(1);
  const totalPages = 12;

  return (
    <div className="grid gap-4">
      <p className="label-brutal text-ink-soft" aria-live="polite">
        Current page: {page} / {totalPages} (demo state)
      </p>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} siblingCount={1} />
    </div>
  );
}
