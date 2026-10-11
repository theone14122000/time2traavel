import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, MapPinned } from "lucide-react";
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
    title: "International Destinations",
    description:
      "Published international destinations from Time to Travel — open one for entry info, photos and related packages.",
    path: "/destinations/international",
  });
}

export default async function InternationalDestinationsPage() {
  const destinations = await getHubDestinations("international");

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: "International" },
            ]}
          />
        </Container>
      </div>

      <PageHeader
        eyebrow="International"
        title="Across the border"
        description="Published destinations outside India. Open one for entry notes, photos and related packages."
        tone="sky"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/destinations/domestic">
          <Globe2 aria-hidden="true" className="size-4" />
          Domestic
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
        aria-labelledby="international-list-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="international-list-heading" className="sr-only">
          International destinations
        </h2>

        {destinations.length === 0 ? (
          <EmptyState
            eyebrow="International"
            title="International trips coming soon"
            description="We haven't published any international destinations yet. Tell us where you'd like to go and we'll plan it with you."
            tone="sky"
            illustration="map"
            action={
              <>
                <Link className={buttonVariants({ variant: "default", size: "md" })} href="/plan-my-trip">
                  Plan a custom trip
                </Link>
                <Link className={buttonVariants({ variant: "outline", size: "md" })} href="/destinations">
                  All destinations
                </Link>
              </>
            }
          />
        ) : (
          <DestinationHubList destinations={destinations} active="international" />
        )}
      </SectionWrapper>
    </>
  );
}
