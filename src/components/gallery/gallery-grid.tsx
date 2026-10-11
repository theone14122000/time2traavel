"use client";

import * as React from "react";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { Lightbox } from "@/components/gallery/lightbox";
import type { GalleryItem } from "@/lib/data/gallery";

/**
 * Wraps the masonry grid with a lightbox — index state lives here so the
 * server page stays a pure listing.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = React.useState<number | null>(null);

  return (
    <>
      <MasonryGrid items={items} onOpen={setIndex} />
      <Lightbox
        items={items}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  );
}
