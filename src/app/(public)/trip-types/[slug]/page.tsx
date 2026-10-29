import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Compass, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrutalImage } from "@/components/ui/brutal-image";
import { buttonVariants } from "@/components/ui/button-variants";
import { PackageGrid } from "@/components/packages/package-grid";
import { getTripTypeBySlug, getPackagesByTripTypeSlug } from "@/lib/data/trip-types";
import { pluralize } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tripType = await getTripTypeBySlug(slug);

  if (!tripType) {
    return buildMetadata({
      title: "Trip type not found",
      description: "This trip type could not be found.",
      path: `/trip-types/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${tripType.name} trips`,
    description:
      tripType.description ?? `Published packages for ${tripType.name.toLowerCase()} travel.`,
    path: `/trip-types/${tripType.slug}`,
    image: tripType.coverImage,
  });
}

export default async function TripTypeDetailPage({ params }: Props) {
  const { slug } = await params;
  const tripType = await getTripTypeBySlug(slug);
  if (!tripType) notFound();

  const packages = await getPackagesByTripTypeSlug(tripType.slug, tripType.name);

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Trip Types", path: "/trip-types" },
    { name: tripType.name, path: `/trip-types/${tripType.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Trip Types", href: "/trip-types" },
              { label: tripType.name },
            ]}
          />
        </Container>
      </div>

      <PageHeader
        eyebrow="Trip type"
        title={tripType.name}
        description={tripType.description}
        tone="lavender"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/trip-types">
          <ArrowLeft aria-hidden="true" className="size-4" />
          All trip types
        </Link>
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/plan-my-trip">
          <Send aria-hidden="true" className="size-4" />
          Plan a {tripType.name.toLowerCase()} trip
        </Link>
      </PageHeader>

      {tripType.coverImage ? (
        <div className="w-full border-b border-line bg-cream">
          <Container className="py-8 sm:py-10">
            <BrutalImage
              src={tripType.coverImage}
              alt={tripType.coverImageAlt || tripType.name}
              aspect="wide"
              priority
              sizes="(max-width: 1024px) 100vw, 80vw"
            />
          </Container>
        </div>
      ) : null}

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="trip-type-packages-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="trip-type-packages-heading"
          eyebrow="Packages"
          title={`${tripType.name} packages`}
          description={`Published packages tagged ${tripType.name.toLowerCase()} in our admin. Custom dates are always fine — just ask.`}
        />

        <p role="status" aria-live="polite" className="mt-4 label-brutal text-ink-soft">
          {pluralize(packages.length, "published package")}
        </p>

        <div className="mt-8">
          {packages.length === 0 ? (
            <EmptyState
              eyebrow="No packages yet"
              title={`No ${tripType.name.toLowerCase()} packages published`}
              description={`We haven't tagged any packages as ${tripType.name.toLowerCase()} yet. Tell us what you're after and we'll plan it with you.`}
              tone="lavender"
              illustration="luggage"
              action={
                <>
                  <Link
                    className={buttonVariants({ variant: "default", size: "md" })}
                    href="/plan-my-trip"
                  >
                    Plan my trip
                  </Link>
                  <Link
                    className={buttonVariants({ variant: "outline", size: "md" })}
                    href="/packages"
                  >
                    <Compass aria-hidden="true" className="size-4" />
                    All packages
                  </Link>
                </>
              }
            />
          ) : (
            <PackageGrid packages={packages} />
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
