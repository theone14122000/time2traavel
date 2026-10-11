import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { SavedView } from "@/components/saved/saved-view";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Saved Items",
    description:
      "Your saved destinations and packages — stored on this device only. Tap a heart anywhere on the site to add to this list.",
    path: "/saved",
    noIndex: true,
  });
}

export default async function SavedPage() {
  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Saved" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Saved"
        title="Your shortlist"
        description="Destinations and packages you've hearted. Everything is stored on this device — clearing your browser data clears this list."
        tone="lavender"
      >
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/destinations">
          <Compass aria-hidden="true" className="size-4" />
          Browse destinations
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/packages">
          Browse packages
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="saved-list-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="saved-list-heading" className="sr-only">
          Saved destinations and packages
        </h2>
        <SavedView />
        <p className="mt-10 flex items-center gap-2 text-xs font-semibold text-ink-soft">
          <Heart aria-hidden="true" className="size-3.5" />
          Tip: hearts also appear on destination and package pages.
        </p>
      </SectionWrapper>
    </>
  );
}
