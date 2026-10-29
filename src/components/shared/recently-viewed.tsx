"use client";

import * as React from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { cn } from "@/lib/utils";

/**
 * Horizontal strip of the visitor's last viewed destinations/packages.
 * Client-only by design: the server snapshot is empty and the strip renders
 * nothing until localStorage has been read, so it never contributes markup to
 * the prerendered HTML. Mount it from a client area of a page (e.g. under a
 * listing grid) — items are recorded by `trackView` from the detail pages.
 */
export function RecentlyViewed({ className }: { className?: string }) {
  const { items, ready } = useRecentlyViewed();

  if (!ready || items.length === 0) return null;

  return (
    <section
      aria-label="Recently viewed"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-center gap-2">
        <History aria-hidden="true" className="size-4 shrink-0" />
        <h2 className="label-brutal">Recently viewed</h2>
      </div>

      <ul className="snap-rail no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <li key={`${item.kind}:${item.id}`} className="shrink-0">
            <Link
              href={item.href}
              className="press tap-44 flex max-w-[15rem] items-center gap-2.5 border border-line bg-paper px-3 py-2 shadow-hard-xs"
            >
              <span
                className={cn(
                  "label-brutal shrink-0 border border-line px-1.5 py-1",
                  item.kind === "destination" ? "bg-mint" : "bg-peach",
                )}
              >
                {item.kind === "destination" ? "Place" : "Pack"}
              </span>
              <span className="line-clamp-1 text-sm font-bold">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
