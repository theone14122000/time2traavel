"use client";

import * as React from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Media } from "@/components/shared/media";
import type { GalleryItem } from "@/lib/data/gallery";

/**
 * Editorial gallery mosaic. Tiles use a repeating rhythm of fixed aspect
 * ratios with object-cover, so the layout never shifts while photos load and
 * uploads without stored dimensions still sit cleanly in the grid.
 */
const RHYTHM = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[4/3]",
  "aspect-[4/5]",
] as const;

export function MasonryGrid({
  items,
  onOpen,
}: {
  items: GalleryItem[];
  onOpen: (index: number) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No photos in this category yet"
        description="Fresh shots are being framed. Check the other categories, or browse everything."
        tone="sky"
      />
    );
  }

  return (
    <ul className="columns-2 gap-3 sm:gap-5 lg:columns-3">
      {items.map((item, index) => (
        <li key={item.id} className="mb-3 break-inside-avoid sm:mb-5">
          <button
            type="button"
            onClick={() => onOpen(index)}
            className={cn(
              "group card-shine skeleton relative block w-full overflow-hidden rounded-2xl border border-line bg-ink text-left shadow-hard-sm",
              "transition-[transform,box-shadow] duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-hard-lg",
              RHYTHM[index % RHYTHM.length],
            )}
            aria-label={`Open photo ${index + 1} of ${items.length}${item.caption ? `: ${item.caption}` : ""}`}
          >
            {item.url ? (
              <Image
                src={item.url}
                alt={item.alt || item.caption || "Travel photo"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            ) : (
              <Media src="" alt={item.alt || item.caption || ""} ratio="wide" label={item.category} />
            )}

            <span
              aria-hidden="true"
              className="absolute inset-0 z-10 bg-gradient-to-t from-ink/75 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            />

            {item.category ? (
              <span className="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">
                {item.category}
              </span>
            ) : null}

            <span
              aria-hidden="true"
              className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Expand className="size-4" />
            </span>

            <span className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4">
              {item.caption ? (
                <span className="line-clamp-2 font-display text-base leading-snug text-white sm:text-lg">
                  {item.caption}
                </span>
              ) : (
                <span className="sr-only">{item.alt || "Travel photo"}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
