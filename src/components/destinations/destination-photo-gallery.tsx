"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Img = { src: string; alt: string };

type Props = {
  images: readonly Img[];
};

export function DestinationPhotoGallery({ images }: Props) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      else if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, images.length]);

  const open = openIndex !== null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden border border-line bg-ink/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink"
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          </button>
        ))}
      </div>

      {open && openIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close lightbox"
            className="absolute right-4 top-4 flex size-10 items-center justify-center border border-cream bg-ink/80 text-cream hover:bg-cream hover:text-ink"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)); }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center border border-cream bg-ink/80 text-cream hover:bg-cream hover:text-ink"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)); }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center border border-cream bg-ink/80 text-cream hover:bg-cream hover:text-ink"
          >
            <ChevronRight className="size-5" />
          </button>

          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex].src}
              alt={images[openIndex].alt}
              width={1600}
              height={1200}
              className="max-h-[85vh] w-auto object-contain"
              priority
            />
            <p className="mt-2 text-center text-sm font-medium text-cream">
              {openIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
