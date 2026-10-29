"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

/**
 * URL-driven package pagination built on the shared brutalist `Pagination`.
 * Keeps the current filter query string and encodes page 1 as the bare
 * /packages URL.
 */
export function PackagePagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  /** Canonical filter query string (without the page param). */
  query: string;
}) {
  const router = useRouter();

  if (totalPages <= 1) return null;

  const goTo = (target: number) => {
    const params = new URLSearchParams(query);
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const qs = params.toString();
    router.push(qs ? `/packages?${qs}` : "/packages", { scroll: false });
  };

  return (
    <div className="mt-10 flex justify-center border border-line bg-paper p-3 shadow-brutal-sm">
      <Pagination page={page} totalPages={totalPages} onPageChange={goTo} />
    </div>
  );
}
