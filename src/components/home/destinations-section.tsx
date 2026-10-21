import Link from "next/link";
import { MapPinned } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { DomesticDestinationsGrid } from "@/components/destinations/domestic-destinations-grid";
import { Button } from "@/components/ui/button";
import { getDomesticDestinations } from "@/lib/data/domestic-destinations";

export async function DestinationsSection() {
  const destinations = await getDomesticDestinations();

  return (
    <section
      id="domestic-destinations"
      aria-labelledby="domestic-destinations-heading"
      className="relative w-full border-y-[3px] border-ink bg-cream"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="domestic-destinations-heading"
            eyebrow="Domestic Destinations"
            title="India is full of plot [[twists]]!"
            gradientTone="ink"
            description="From quiet Himalayan valleys to vibrant destinations, discover experiences across India."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/destinations">
              <MapPinned aria-hidden="true" className="size-4" />
              All destinations
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <DomesticDestinationsGrid destinations={destinations} />
        </div>
      </div>
    </section>
  );
}
