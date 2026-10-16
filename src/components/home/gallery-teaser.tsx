import Link from "next/link";
import { Images } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { Badge } from "@/components/ui/badge";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { getGalleryItems } from "@/lib/data/gallery";

const ASPECTS = ["landscape", "square", "portrait", "wide"] as const;

/**
 * Gallery band — latest six gallery items in a masonry-style column layout.
 * Hides itself completely when the admin hasn't uploaded anything yet.
 */
export async function GalleryTeaser() {
  const items = await getGalleryItems({ limit: 6 });

  if (items.length === 0) return null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative w-full border-y-[3px] border-ink bg-paper"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="gallery-heading"
            eyebrow="Gallery"
            title="Snapshots from the road"
            description="Photos uploaded by our team — destinations, stays and moments from the road."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/gallery">
              <Images aria-hidden="true" className="size-4" />
              Open gallery
            </Link>
          </Button>
        </div>

        <div className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {items.map((item, index) => (
            <figure
              key={item.id}
              className="mb-6 break-inside-avoid border-[3px] border-ink bg-paper shadow-hard"
            >
              <BrutalImage
                src={item.url}
                alt={item.alt}
                aspect={ASPECTS[index % ASPECTS.length]}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                className="border-0 border-b-[3px]"
              />
              <figcaption className="flex flex-wrap items-center justify-between gap-2 p-3">
                <span className="text-xs font-semibold text-ink-soft">
                  {item.caption?.trim() || item.alt}
                </span>
                <Badge variant="soft" size="sm">
                  {item.category}
                </Badge>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
