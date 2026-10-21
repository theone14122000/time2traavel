import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, Compass, Send, Sun } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Container } from "@/components/shared/container";
import { RevealTitle } from "@/components/shared/motion";
import { SectionWrapper } from "@/components/shared/section";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge, Stamp } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrutalImage } from "@/components/ui/brutal-image";
import { SectionDivider } from "@/components/ui/dividers";
import { buttonVariants } from "@/components/ui/button-variants";
import { DestinationEnquiryButton } from "@/components/destinations/destination-enquiry";
import { WeatherWidget } from "@/components/destinations/weather-widget";
import { PackageGrid } from "@/components/packages/package-grid";
import { getDestinationBySlug } from "@/lib/data/destinations";
import { DomesticDestinationDetail } from "@/components/destinations/domestic-destination-detail";
import { getDomesticDestinationBySlug } from "@/lib/data/domestic-destinations";
import { originalUrl } from "@/lib/domestic-destinations";
import { getPackagesByDestination } from "@/lib/data/packages";
import { toGallery } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [
    "jammu-and-kashmir",
    "assam",
    "gujarat",
    "himachal-pradesh",
    "rajasthan",
    "tamil-nadu",
    "uttar-pradesh",
    "uttarakhand",
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const domestic = await getDomesticDestinationBySlug(slug);
  if (domestic) {
    const cover = domestic.images[Math.min(domestic.coverIndex, domestic.images.length - 1)] ?? domestic.images[0];
    return buildMetadata({
      title: `${domestic.name} — Domestic Destination`,
      description: domestic.overview,
      path: `/destinations/${domestic.slug}`,
      image: cover ? originalUrl(cover) : null,
    });
  }
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    return buildMetadata({
      title: "Destination not found",
      description: "This destination could not be found.",
      path: `/destinations/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: destination.seoTitle ?? `${destination.name}, ${destination.state}`,
    description:
      destination.seoDescription ??
      destination.summary ??
      destination.description ??
      `Details for ${destination.name}, ${destination.state}.`,
    path: `/destinations/${destination.slug}`,
    image: destination.image,
  });
}

/** Section eyebrow + masked reveal heading (id hook kept for aria-labelledby). */
function BandHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span className="label-brutal w-fit border-[3px] border-ink bg-lemon px-3 py-2">
        {eyebrow}
      </span>
      <div id={id}>
        <RevealTitle as="h2" className="max-w-[22ch] text-h2">
          {title}
        </RevealTitle>
      </div>
      {description ? (
        <p className="max-w-2xl text-lead font-medium text-ink-soft">{description}</p>
      ) : null}
    </div>
  );
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const domestic = await getDomesticDestinationBySlug(slug);
  if (domestic) {
    return <DomesticDestinationDetail slug={slug} />;
  }

  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const gallery = toGallery(destination.gallery);
  const heroImage = destination.image ?? gallery[0]?.url ?? null;
  const related = await getPackagesByDestination(destination.id, 4);

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: destination.name, path: `/destinations/${destination.slug}` },
  ]);

  const breadcrumbTrail = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: destination.name },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={breadcrumbTrail} />
        </Container>
      </div>

      <PageHeader
        eyebrow={
          destination.region ? `${destination.state} Â· ${destination.region}` : destination.state
        }
        title={destination.name}
        description={destination.summary}
        tone="mint"
      >
        <DestinationEnquiryButton slug={destination.slug} name={destination.name} />
        <Link
          className={buttonVariants({ variant: "outline", size: "lg" })}
          href="/destinations"
        >
          All destinations
        </Link>
      </PageHeader>

      <SectionDivider variant="thick" tone="lemon" />

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="destination-overview-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <BandHeading
          id="destination-overview-heading"
          eyebrow="Overview"
          title={`About ${destination.name}`}
          description={`Everything below comes straight from our ${destination.name} listing.`}
        />

        <div className="mt-8">
          <BrutalImage
            src={heroImage}
            alt={destination.imageAlt ?? destination.name}
            aspect="wide"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge variant="dark" size="lg">
            {destination.state}
          </Badge>
          {destination.region ? (
            <Badge variant="soft" size="lg">
              {destination.region}
            </Badge>
          ) : null}
          {destination.featured ? (
            <Stamp variant="mint">Featured</Stamp>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            {destination.description ? (
              <div className="brutal-prose max-w-3xl whitespace-pre-line">
                {destination.description}
              </div>
            ) : (
              <p className="max-w-3xl text-base font-medium leading-relaxed text-ink-soft">
                A detailed write-up for {destination.name} is on the way. Enquire now and
                we&apos;ll share everything you need to plan the trip.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <DestinationEnquiryButton
                slug={destination.slug}
                name={destination.name}
                label="Enquire about this destination"
                size="lg"
              />
              <Link
                className={buttonVariants({ variant: "outline", size: "lg" })}
                href="/packages"
              >
                Packages for {destination.name}
              </Link>
            </div>
          </div>

          <aside className="grid content-start gap-6">
            <WeatherWidget place={destination.name} />

            {destination.bestTimeToVisit ? (
              <div className="border-4 border-ink bg-mint p-5 shadow-brutal-md">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center border-[3px] border-ink bg-paper"
                  >
                    <Sun className="size-4" />
                  </span>
                  <h3 className="font-display text-h4 uppercase">Best time to visit</h3>
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed sm:text-base">
                  {destination.bestTimeToVisit}
                </p>
              </div>
            ) : null}

            <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
              <h3 className="font-display text-h4 uppercase">Plan this trip</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink-soft">
                Send your dates, group size and any must-dos â€” we&apos;ll reply with a
                plan built around {destination.name}.
              </p>
              <DestinationEnquiryButton
                slug={destination.slug}
                name={destination.name}
                label="Start an enquiry"
                size="md"
                className="mt-4 w-full"
              />
            </div>
          </aside>
        </div>
      </SectionWrapper>

      {gallery.length > 0 ? (
        <>
          <SectionDivider variant="torn" tone="ink" flip />

          <SectionWrapper
            tone="butter"
            bordered
            aria-labelledby="destination-gallery-heading"
            containerClassName="py-12 sm:py-16 lg:py-20"
          >
            <BandHeading
              id="destination-gallery-heading"
              eyebrow="Gallery"
              title={`Photos of ${destination.name}`}
              description="Hover an image to zoom â€” open the enquiry form if a shot sells the trip."
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <BrutalImage
                  key={`${image.url}-${index}`}
                  src={image.url}
                  alt={image.alt || `${destination.name} photo ${index + 1}`}
                  aspect="landscape"
                  zoom
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ))}
            </div>
          </SectionWrapper>
        </>
      ) : null}

      <SectionDivider variant="zigzag" tone="lemon" />

      <SectionWrapper
        tone="sky"
        bordered
        aria-labelledby="destination-packages-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <BandHeading
          id="destination-packages-heading"
          eyebrow="Packages"
          title={`Trips covering ${destination.name}`}
          description="Published packages linked to this destination. Enquire for custom dates or group sizes."
        />

        <div className="mt-8">
          {related.length === 0 ? (
            <EmptyState
              eyebrow="Packages"
              title="No packages listed yet"
              description={`We haven't published packages for ${destination.name} yet â€” send an enquiry and we'll plan one with you.`}
              tone="paper"
              icon={<Compass className="size-8" aria-hidden="true" />}
              action={
                <DestinationEnquiryButton
                  slug={destination.slug}
                  name={destination.name}
                  label="Enquire about a trip"
                  size="md"
                />
              }
            />
          ) : (
            <PackageGrid packages={related} />
          )}
        </div>
      </SectionWrapper>

      <SectionDivider variant="stripe" tone="ink" />

      <section
        id="destination-plan"
        aria-labelledby="destination-plan-heading"
        className="relative w-full border-b-[3px] border-ink bg-peach"
      >
        <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2">
                <CalendarRange aria-hidden="true" className="size-3.5" />
                Plan this trip
              </span>
              <h2
                id="destination-plan-heading"
                className="mt-5 max-w-[18ch] text-h2"
              >
                Ready when you are
              </h2>
              <p className="mt-4 max-w-xl text-lead font-medium text-ink-soft">
                Send your dates, group size and any must-dos for {destination.name} â€”
                we&apos;ll come back with a plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DestinationEnquiryButton
                slug={destination.slug}
                name={destination.name}
                label="Enquire now"
                size="xl"
              />
              <Link
                className={buttonVariants({ variant: "outline", size: "xl" })}
                href="/about-us#contact"
              >
                <Send aria-hidden="true" className="size-4" />
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-24 left-3 z-40 sm:left-6 lg:bottom-6">
        <div className="pointer-events-auto">
          <DestinationEnquiryButton
            slug={destination.slug}
            name={destination.name}
            label="Enquire"
            size="lg"
            className="shadow-hard-xl"
          />
        </div>
      </div>
    </>
  );
}
