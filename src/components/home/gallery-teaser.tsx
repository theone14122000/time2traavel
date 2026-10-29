import Link from "next/link";
import { Images } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { Badge } from "@/components/ui/badge";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { getGalleryItems } from "@/lib/data/gallery";
import { getGalleryFallbacks } from "@/lib/home-fallback-images";

const ASPECTS = ["landscape", "square", "portrait", "wide"] as const;

type GalleryFigure = {
  key: string;
  url: string;
  alt: string;
  caption: string;
  category: string;
};

/**
 * Gallery band — latest six gallery items in a masonry-style column layout.
 * Falls back to curated local photos from public/images when the admin
 * hasn't uploaded anything yet, so the band never disappears.
 */
export async function GalleryTeaser() {
  const items = await getGalleryItems({ limit: 6 });
  const usingFallback = items.length === 0;

  const figures: GalleryFigure[] = usingFallback
    ? getGalleryFallbacks().map((img, i) => ({
        key: `fallback-${i}`,
        url: img.src,
        alt: img.alt,
        caption: img.caption,
        category: img.regionLabel,
      }))
    : items.map((item) => ({
        key: item.id,
        url: item.url,
        alt: item.alt,
        caption: item.caption?.trim() || item.alt,
        category: item.category,
      }));

  if (figures.length === 0) return null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative w-full border-y border-line bg-paper"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="gallery-heading"
            eyebrow="Gallery"
            title="Moments from the [[road]]"
            gradientTone="ink"
            description={
              usingFallback
                ? "A look at the places we plan trips to — Himalayan passes, green valleys, and island shores."
                : "Photos uploaded by our team — destinations, stays and moments from the road."
            }
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/gallery">
              <Images aria-hidden="true" className="size-4" />
              Open gallery
            </Link>
          </Button>
        </div>

        <div className="mt-8 columns-2 gap-3 sm:gap-6 lg:columns-3">
          {figures.map((figure, index) => (
            <figure
              key={figure.key}
              className="mb-3 break-inside-avoid border border-line bg-paper shadow-hard sm:mb-6"
            >
              <BrutalImage
                src={figure.url}
                alt={figure.alt}
                aspect={ASPECTS[index % ASPECTS.length]}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                className="border-0 border-b"
              />
              <figcaption className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-3">
                <span className="line-clamp-2 text-xs font-semibold text-ink-soft">
                  {figure.caption}
                </span>
                <Badge variant="soft" size="sm" className="hidden sm:inline-flex">
                  {figure.category}
                </Badge>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
