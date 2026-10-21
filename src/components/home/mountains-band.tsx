import * as React from "react";
import Link from "next/link";
import { Mountain, Route } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { CardSlideshow } from "@/components/ui/card-slideshow";
import { Button } from "@/components/ui/button";
import { MountainParallax } from "@/components/home/mountain-parallax";
import { allocateImages } from "@/lib/image-allocator";
import { IMAGE_MANIFEST } from "@/lib/image-manifest";

/**
 * Signature band — "Into the Mountains".
 * Layered navy/teal silhouettes + auto-toggling CardSlideshow of
 * domestic mountain-region photos from the image library.
 */
export async function MountainsBand() {
  // Pool: domestic mountain-region images from the manifest.
  const mountainPool = IMAGE_MANIFEST.filter(
    (img) =>
      img.isDomestic &&
      (img.region === "himachal" ||
        img.region === "ladakh" ||
        img.region === "kashmir" ||
        img.region === "uttarakhand" ||
        img.region === "sikkim" ||
        img.region === "northeast"),
  );

  const picked = allocateImages(mountainPool, 6, "mountains-band-slideshow");
  const slides = picked.map((img) => ({
    src: img.url,
    // Neutral alt: the pool spans several states and the photos are not
    // matched to specific places.
    alt: `Scenic travel view — ${img.region.replace(/^\w/, (c) => c.toUpperCase())}`,
  }));

  return (
    <section
      id="mountains"
      aria-labelledby="mountains-heading"
      className="relative w-full overflow-hidden border-y-[3px] border-ink bg-ink text-cream clip-x"
    >
      {/* layered silhouettes — decorative, aria-hidden */}
      <MountainParallax />

      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-24 xl:px-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <HomeSectionHeading
              id="mountains-heading"
              eyebrow="No signal. All adventure."
              tone="ink"
              title="The [[Himalayas]] are calling!"
              gradientTone="onDark"
              description="Pick up the adventure — winding roads, hidden valleys, and unforgettable high-country escapes."
            />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/destinations">
                  <Mountain aria-hidden="true" className="size-5" />
                  Enter the mountains
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-cream bg-transparent text-cream hover:bg-cream hover:text-ink sm:w-auto"
              >
                <Link href="/packages">
                  <Route aria-hidden="true" className="size-5" />
                  View packages
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <CardSlideshow
              images={slides}
              label="Himalayan destination photos"
              className="mx-auto max-w-md lg:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
