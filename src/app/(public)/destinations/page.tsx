import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { DestinationHubTabs } from "@/components/destinations/hub-list";
import { DestinationGrid } from "@/components/home/destination-grid";
import { FaqSection } from "@/components/home/faq-section";
import { Reveal } from "@/components/shared/reveal";
import { buttonVariants } from "@/components/ui/button-variants";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Destinations",
    description:
      "Browse every published Time to Travel destination â€” filter by region, open a destination for details and related packages, and enquire from the card.",
    path: "/destinations",
  });
}

export default async function DestinationsPage() {
  const destinations = await getPublishedDestinations();

  return (
    <>
      <PageHeader
        eyebrow="Destinations"
        title="Where do you want to go?"
        description="Every destination below is published by our team. Filter by region, open one for photos and trip ideas, or enquire straight from the card."
        tone="mint"
      >
        {destinations.length > 0 ? (
          <span className="label-brutal border-[3px] border-ink bg-paper px-3 py-2 text-ink">
            {pluralize(destinations.length, "published destination")}
          </span>
        ) : null}
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/packages">
          <MapPinned aria-hidden="true" className="size-4" />
          Browse packages
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/about-us#contact">
          Contact us
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="destinations-grid-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="destinations-grid-heading"
          eyebrow="Explore"
          title="All destinations"
          description="Pick a region chip to narrow the list â€” enquire opens a pre-filled form for that destination."
        />

        <div className="mt-8">
          <DestinationHubTabs active="all" />
        </div>

        <div className="mt-6">
          <DestinationGrid destinations={destinations} showViewAll={false} />
        </div>
      </SectionWrapper>

      <FaqSection />

      <section
        id="destinations-cta"
        aria-labelledby="destinations-cta-heading"
        className="relative w-full border-b-[3px] border-ink bg-peach"
      >
        <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2">
                  Not sure yet?
                </span>
                <h2
                  id="destinations-cta-heading"
                  className="mt-5 max-w-[16ch] text-h2"
                >
                  Tell us the vibe, we&apos;ll find the place
                </h2>
                <p className="mt-4 max-w-xl text-lead font-medium text-ink-soft">
                  If none of the destinations above match what you have in mind, send us a
                  quick message with your dates and group â€” we&apos;ll take it from there.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  className={buttonVariants({ variant: "default", size: "xl" })}
                  href="/about-us#contact"
                >
                  <Send aria-hidden="true" className="size-4" />
                  Plan a trip
                </Link>
                <Link
                  className={buttonVariants({ variant: "outline", size: "xl" })}
                  href="/packages"
                >
                  View packages
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
