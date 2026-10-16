"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Media } from "@/components/shared/media";
import type { GalleryItem } from "@/lib/data/gallery";

/**
 * CSS-columns masonry grid — items keep their natural aspect ratio.
 */
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
        illustration="map"
        tone="sky"
      />
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(index)}
          className="group block w-full break-inside-avoid border-[3px] border-ink bg-paper p-0 text-left shadow-hard-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky"
          aria-label={`Open photo ${index + 1} of ${items.length}${item.caption ? `: ${item.caption}` : ""}`}
        >
          <div className="relative w-full overflow-hidden border-b-[3px] border-ink">
            {item.url ? (
              <Image
                src={item.url}
                alt={item.alt || item.caption || "Travel photo"}
                width={item.width ?? 1200}
                height={item.height ?? 800}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={cn(
                  "h-auto w-full object-cover transition-transform duration-200",
                  "group-hover:scale-[1.02]",
                )}
              />
            ) : (
              <Media
                src=""
                alt={item.alt || item.caption || ""}
                ratio="wide"
                label={item.category}
              />
            )}
            {item.category ? (
              <span className="absolute left-3 top-3 inline-flex items-center border-[2px] border-ink bg-lemon px-2 py-1 text-xs font-bold uppercase tracking-wide shadow-hard-xs">
                {item.category}
              </span>
            ) : null}
          </div>
          {item.caption ? (
            <p className="px-3 py-2.5 text-sm font-semibold leading-snug">{item.caption}</p>
          ) : (
            <span className="sr-only">{item.alt || "Travel photo"}</span>
          )}
        </button>
      ))}
    </div>
  );
}
