"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/data/gallery";

/**
 * Full-screen lightbox — previous/next, keyboard navigation, caption strip.
 */
export function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: GalleryItem[];
  index: number | null;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const open = index !== null && index >= 0 && index < items.length;
  const active = open ? items[index] : undefined;
  const total = items.length;

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && index !== null) {
        onIndexChange(index === 0 ? total - 1 : index - 1);
      }
      if (event.key === "ArrowRight" && index !== null) {
        onIndexChange(index === total - 1 ? 0 : index + 1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, index, total, onIndexChange, onClose]);

  function go(delta: number) {
    if (index === null || total === 0) return;
    onIndexChange((index + delta + total) % total);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-5xl gap-0 border-[4px] border-ink bg-ink p-0 shadow-brutal-lg">
        {active ? (
          <div className="relative">
            <div className="relative flex max-h-[70vh] items-center justify-center overflow-hidden bg-ink">
              {active.url ? (
                <Image
                  src={active.url}
                  alt={active.alt || active.caption || "Travel photo"}
                  width={active.width ?? 1600}
                  height={active.height ?? 1067}
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className="h-auto max-h-[70vh] w-auto object-contain"
                  priority
                />
              ) : (
                <p className="p-10 text-sm font-semibold text-paper">Photo unavailable</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t-[4px] border-ink bg-paper px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => go(-1)}
                aria-label="Previous photo"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>

              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-semibold">
                  {active.caption || active.alt || "Travel photo"}
                </p>
                <p className="label-brutal text-ink-soft">
                  {index !== null ? index + 1 : 0} / {total}
                  {active.category ? ` · ${active.category}` : ""}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => go(1)}
                aria-label="Next photo"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close photo viewer"
              className={cn(
                "absolute right-3 top-3 z-10 flex size-11 items-center justify-center",
                "border-[3px] border-ink bg-paper shadow-hard-sm transition-all hover:bg-lemon",
              )}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
