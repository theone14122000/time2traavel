import type { Metadata } from "next";
import Link from "next/link";
import { Compass, MapPinned } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  DestinationHubList,
  getHubDestinations,
} from "@/components/destinations/hub-list";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Domestic Destinations",
    description:
      "Published Indian destinations from Time to Travel — filter by region and enquire from any card.",
    path: "/destinations/domestic",
  });
}

export default async function DomesticDestinationsPage() {
  const destinations = await getHubDestinations("domestic");

  return (
    <>
      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: "Domestic" },
            ]}
          />
        </Container>
      </div>

      <PageHeader
        eyebrow="Domestic"
        title="Across India"
        description="Published destinations inside India — from the hills to the coast. Open one for details and related packages."
        tone="mint"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/destinations/international">
          <Compass aria-hidden="true" className="size-4" />
          International
        </Link>
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/packages">
          <MapPinned aria-hidden="true" className="size-4" />
          Browse packages
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="domestic-list-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="domestic-list-heading" className="sr-only">
          Domestic destinations
        </h2>

        {destinations.length === 0 ? (
          <EmptyState
            eyebrow="Domestic"
            title="No domestic destinations published yet"
            description="We haven't published any Indian destinations yet. Tell us where you'd like to go and we'll plan it with you."
            tone="mint"
            illustration="map"
            action={
              <>
                <Link className={buttonVariants({ variant: "default", size: "md" })} href="/plan-my-trip">
                  Plan my trip
                </Link>
                <Link className={buttonVariants({ variant: "outline", size: "md" })} href="/destinations">
                  All destinations
                </Link>
              </>
            }
          />
        ) : (
          <DestinationHubList destinations={destinations} active="domestic" />
        )}
      </SectionWrapper>
    </>
  );
}
