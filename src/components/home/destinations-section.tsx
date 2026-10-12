import Link from "next/link";
import { MapPinned } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { DestinationGrid } from "@/components/home/destination-grid";
import { Button } from "@/components/ui/button";

/**
 * Destinations band — fetches published destinations (fail-safe empty) and
 * hands them to the client grid for region/state filtering.
 */
export async function DestinationsSection() {
  const destinations = await getPublishedDestinations({ limit: 9 });

  return (
    <section
      id="destinations"
      aria-labelledby="destinations-heading"
      className="relative w-full border-y-[3px] border-ink bg-cream"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="destinations-heading"
            eyebrow="Choose your next quest"
            title="India is full of plot twists!"
            description="From quiet Himalayan valleys to vibrant destinations, discover experiences across incredible India."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/destinations">
              <MapPinned aria-hidden="true" className="size-4" />
              All destinations
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <DestinationGrid destinations={destinations} />
        </div>
      </div>
    </section>
  );
}
