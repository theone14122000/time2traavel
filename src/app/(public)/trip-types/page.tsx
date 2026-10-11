import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrutalImage } from "@/components/ui/brutal-image";
import { buttonVariants } from "@/components/ui/button-variants";
import { getPublishedTripTypes, type TripTypeCard } from "@/lib/data/trip-types";
import { cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Trip Types",
    description:
      "Browse trips by the way you travel — family, honeymoon, adventure, group, weekend, pilgrimage and corporate. Every type links to published packages.",
    path: "/trip-types",
  });
}

const COLOR_CLASSES: Record<string, string> = {
  lemon: "bg-lemon",
  butter: "bg-butter",
  mint: "bg-mint",
  sky: "bg-sky",
  peach: "bg-peach",
  lavender: "bg-lavender",
  blush: "bg-blush",
  sand: "bg-sand",
};

function typeAccent(color: string | null): string {
  if (!color) return "bg-lavender";
  return COLOR_CLASSES[color.toLowerCase()] ?? "bg-lavender";
}

function TripTypeTile({ tripType }: { tripType: TripTypeCard }) {
  return (
    <article className="flex h-full flex-col border-4 border-ink bg-paper shadow-brutal-md transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg">
      <div className={cn("relative border-b-[3px] border-ink", typeAccent(tripType.color))}>
        <BrutalImage
          src={tripType.coverImage}
          alt={tripType.coverImageAlt || tripType.name}
          aspect="wide"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
        />
        {tripType.icon ? (
          <span className="absolute left-3 top-3 flex size-10 items-center justify-center border-[3px] border-ink bg-paper font-display text-lg shadow-hard-xs">
            {tripType.icon}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="font-display text-h4 uppercase leading-tight">{tripType.name}</h2>
        {tripType.description ? (
          <p className="text-sm font-medium leading-relaxed text-ink-soft">
            {tripType.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            href={`/trip-types/${tripType.slug}`}
          >
            View trips
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function TripTypesPage() {
  const tripTypes = await getPublishedTripTypes();

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Trip Types" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Trip Types"
        title="Travel your way"
        description="Family, honeymoon, adventure, group, weekend, pilgrimage or corporate — open a type to see the packages tagged with it."
        tone="lavender"
      >
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/packages">
          <Compass aria-hidden="true" className="size-4" />
          All packages
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="trip-types-grid-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="trip-types-grid-heading" className="sr-only">
          Published trip types
        </h2>

        {tripTypes.length === 0 ? (
          <EmptyState
            eyebrow="Trip types"
            title="Trip types coming soon"
            description="We haven't published trip types yet. Browse all packages or tell us how you like to travel."
            tone="lavender"
            illustration="map"
            action={
              <Link className={buttonVariants({ variant: "default", size: "md" })} href="/packages">
                Browse packages
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tripTypes.map((tripType) => (
              <TripTypeTile key={tripType.id} tripType={tripType} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
