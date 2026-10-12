import * as React from "react";
import Link from "next/link";
import { ArrowRight, Mountain, Route } from "lucide-react";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { MountainParallax } from "@/components/home/mountain-parallax";

/**
 * Signature band — "Into the Mountains".
 * Layered navy/teal silhouettes + real published destinations.
 * Decorative layers only; no invented trek data.
 */
export async function MountainsBand() {
  const destinations = await getPublishedDestinations({ limit: 3 });
  const withImages = destinations.filter((d) => d.image && d.image.trim().length > 0);

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
              title="The Himalayas are calling!"
              panelWords={2}
              panelTone="mint"
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

          {/* real destination snapshots */}
          {withImages.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
              {withImages.map((dest, index) => (
                <li key={dest.id} className={index === 0 ? "sm:col-span-2" : undefined}>
                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="group block focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-lemon"
                  >
                    <figure className="relative aspect-[4/3] overflow-hidden border-[3px] border-cream/90 bg-ink shadow-brutal-sm transition-transform duration-200 group-hover:-translate-y-1 sm:aspect-[3/4]">
                      <BrutalImage
                        src={dest.image}
                        alt={dest.imageAlt?.trim() || dest.name}
                        decorative={false}
                        aspect="free"
                        sizes="(max-width: 640px) 90vw, 28vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 border-t-[3px] border-cream/90 bg-ink/85 px-3 py-2">
                        <span className="label-brutal text-lemon">{dest.name}</span>
                        {dest.state ? (
                          <span className="mt-1 block text-xs font-medium text-cream/80">
                            {dest.state}
                          </span>
                        ) : null}
                      </figcaption>
                    </figure>
                  </Link>
                </li>
              ))}
              <li className="flex items-end sm:col-span-3">
                <Link
                  href="/destinations"
                  className="label-brutal inline-flex min-h-11 items-center gap-1.5 text-lemon underline-offset-4 hover:underline"
                >
                  All mountain destinations
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </li>
            </ul>
          ) : (
            <div className="flex items-center justify-center lg:col-span-7">
              <p className="max-w-md border-[3px] border-cream/40 p-6 text-center text-cream/70">
                Himalayan destination photos will appear here once published
                from the admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
