import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CircleX,
  Clock3,
  Compass,
  Highlighter,
  MapPinned,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, Stamp } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrutalImage } from "@/components/ui/brutal-image";
import { SectionDivider } from "@/components/ui/dividers";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { RevealTitle } from "@/components/shared/motion";
import { SectionHeading, SectionWrapper } from "@/components/shared/section";
import { PackageDetailActions } from "@/components/packages/package-detail-actions";
import { PackageEnquiryButton } from "@/components/packages/package-enquiry";
import { PackageGrid } from "@/components/packages/package-grid";
import { PackageShare } from "@/components/packages/package-share";
import { PrintItineraryButton } from "@/components/packages/print-itinerary";
import { CompareProvider } from "@/components/packages/compare-context";
import { CompareTray } from "@/components/packages/compare-tray";
import { ReviewForm } from "@/components/forms/review-form";
import { getDestinationBySlug } from "@/lib/data/destinations";
import { getPackageBySlug, getPackagesByDestination } from "@/lib/data/packages";
import { durationLabel, formatPrice, toGallery, toStringArray } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildProductJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);

  if (!pkg) {
    return buildMetadata({
      title: "Package not found",
      description: "This package could not be found.",
      path: `/packages/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: pkg.seoTitle ?? pkg.title,
    description:
      pkg.seoDescription ??
      pkg.summary ??
      pkg.description ??
      `${pkg.title} — travel package from Time to Travel.`,
    path: `/packages/${pkg.slug}`,
    image: pkg.image,
  });
}

/** Icon list row used by the highlights / inclusions / exclusions panels. */
function BrutalIconList({
  items,
  tone,
}: {
  items: string[];
  tone: "mint" | "peach";
}) {
  const toneClass = tone === "mint" ? "bg-mint-strong" : "bg-coral";
  return (
    <ul className="grid gap-2.5">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex items-start gap-3 border-[3px] border-ink bg-paper px-4 py-3 shadow-brutal-sm"
        >
          <span
            aria-hidden="true"
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center border-[2px] border-ink ${toneClass}`}
          >
            {tone === "mint" ? (
              <BadgeCheck className="size-3.5" />
            ) : (
              <CircleX className="size-3.5" />
            )}
          </span>
          <span className="text-sm font-medium leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
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

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const highlights = toStringArray(pkg.highlights);
  const inclusions = toStringArray(pkg.inclusions);
  const exclusions = toStringArray(pkg.exclusions);
  const gallery = toGallery(pkg.gallery);
  const itinerary = [...pkg.itinerary].sort((a, b) => a.day - b.day);
  const duration = durationLabel(pkg.durationDays, pkg.durationLabel);
  const priceLabel =
    pkg.price != null ? formatPrice(pkg.price, pkg.currency) : (pkg.priceNote ?? null);
  const heroImage = pkg.image ?? gallery[0]?.url ?? null;

  let related: Awaited<ReturnType<typeof getPackagesByDestination>> = [];
  if (pkg.destination) {
    const destination = await getDestinationBySlug(pkg.destination.slug);
    if (destination) {
      const sameDestination = await getPackagesByDestination(destination.id, 8);
      related = sameDestination.filter((item) => item.id !== pkg.id).slice(0, 4);
    }
  }

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    ...(pkg.destination
      ? [
          {
            name: pkg.destination.name,
            path: `/destinations/${pkg.destination.slug}`,
          },
        ]
      : []),
    { name: pkg.title, path: `/packages/${pkg.slug}` },
  ];

  const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbItems);
  const productLd = buildProductJsonLd({
    name: pkg.title,
    description: pkg.summary ?? pkg.description,
    path: `/packages/${pkg.slug}`,
    image: pkg.image,
    price: pkg.price,
    currency: pkg.currency,
    durationDays: pkg.durationDays,
  });

  return (
    <CompareProvider>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={productLd} />

      <div className="border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={breadcrumbItems.map((item) => ({
              label: item.name,
              href: item.path,
            }))}
          />
        </Container>
      </div>

      <PageHeader
        eyebrow={pkg.destination?.name ?? "Package"}
        title={pkg.title}
        description={pkg.summary}
        tone="sky"
      >
        <div className="flex flex-wrap gap-2">
          {duration ? (
            <Badge variant="soft" size="lg">
              <Clock3 aria-hidden="true" className="size-3" />
              {duration}
            </Badge>
          ) : null}
          {priceLabel ? (
            <Badge variant="default" size="lg">
              From {priceLabel}
            </Badge>
          ) : (
            <Badge variant="soft" size="lg">
              Price on request
            </Badge>
          )}
        </div>
      </PageHeader>

      <SectionDivider variant="thick" tone="lemon" />

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="package-overview-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <div className="relative">
              <BrutalImage
                src={heroImage}
                alt={pkg.imageAlt ?? pkg.title}
                aspect="wide"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              {pkg.featured ? (
                <span className="absolute -left-3 -top-3 z-[2]" style={{ rotate: "-6deg" }}>
                  <Stamp>Popular</Stamp>
                </span>
              ) : null}
            </div>

            {/* No createdAt in the detail select — so no "New" stamp is ever rendered. */}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {duration ? (
                <Badge variant="soft" size="lg">
                  <Clock3 aria-hidden="true" className="size-3" />
                  {duration}
                </Badge>
              ) : null}
              {pkg.destination ? (
                <Link
                  href={`/destinations/${pkg.destination.slug}`}
                  className="label-brutal inline-flex items-center gap-1.5 border-[2px] border-ink bg-sky px-3 py-2 transition-colors hover:bg-sky-strong"
                >
                  <MapPinned aria-hidden="true" className="size-3.5" />
                  {pkg.destination.name}
                </Link>
              ) : null}
            </div>

            <div className="mt-6 border-4 border-ink bg-sunrise p-5 shadow-brutal-md">
              <span className="label-brutal text-ink-soft">Price</span>
              <p className="mt-2 font-display text-h2 uppercase leading-none">
                {pkg.price != null
                  ? `From ${formatPrice(pkg.price, pkg.currency)}`
                  : (pkg.priceNote ?? "On request")}
              </p>
              {pkg.price != null && pkg.priceNote ? (
                <p className="mt-2 text-sm font-medium text-ink-soft">{pkg.priceNote}</p>
              ) : null}
            </div>

            <div className="mt-8">
              <BandHeading id="package-overview-heading" eyebrow="Overview" title="Trip overview" />
              {pkg.description ? (
                <div className="brutal-prose mt-5 max-w-3xl whitespace-pre-line">
                  {pkg.description}
                </div>
              ) : (
                <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-ink-soft">
                  A detailed itinerary for {pkg.title} is on the way. Send an enquiry and
                  we&apos;ll share the full plan with you.
                </p>
              )}
            </div>

            {highlights.length > 0 ? (
              <div className="mt-8 border-4 border-ink bg-paper p-5 shadow-brutal-md">
                <h3 className="flex items-center gap-2 font-display text-h4 uppercase">
                  <Highlighter aria-hidden="true" className="size-5" />
                  Highlights
                </h3>
                <div className="mt-4">
                  <BrutalIconList items={highlights} tone="mint" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid content-start gap-6">
            <PackageDetailActions
              slug={pkg.slug}
              title={pkg.title}
              priceLabel={priceLabel}
              durationText={duration || null}
              destinationName={pkg.destination?.name}
              destinationSlug={pkg.destination?.slug}
              comparePkg={pkg}
            />

            <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
              <h3 className="font-display text-h4 uppercase">Share &amp; save</h3>
              <div className="mt-4 grid gap-4">
                <PackageShare title={pkg.title} path={`/packages/${pkg.slug}`} />
                <PrintItineraryButton
                  title={pkg.title}
                  destinationName={pkg.destination?.name}
                  durationText={duration || null}
                  priceLabel={priceLabel}
                  summary={pkg.summary}
                  itinerary={itinerary}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {itinerary.length > 0 ? (
        <>
          <SectionDivider variant="torn" tone="ink" flip />

          <SectionWrapper
            tone="paper"
            bordered
            aria-labelledby="package-itinerary-heading"
            containerClassName="py-12 sm:py-16 lg:py-20"
          >
            <BandHeading
              id="package-itinerary-heading"
              eyebrow="Itinerary"
              title="Day-by-day plan"
              description="Every day is listed below — expand a day to read the full plan."
            />

            <div className="mt-8">
              <Accordion type="multiple" className="grid gap-4">
                {itinerary.map((day) => (
                  <AccordionItem key={`day-${day.day}`} value={`day-${day.day}`}>
                    <AccordionTrigger>
                      <span className="flex items-center gap-3">
                        <span className="sr-only">Day {day.day}: </span>
                        <span
                          aria-hidden="true"
                          className="flex size-10 shrink-0 items-center justify-center border-[3px] border-ink bg-lemon font-display text-base shadow-brutal-sm"
                        >
                          {day.day}
                        </span>
                        <span className="min-w-0 flex-1">{day.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>{day.description}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </SectionWrapper>
        </>
      ) : null}

      <SectionDivider variant="zigzag" tone="lemon" />

      <SectionWrapper
        tone="butter"
        bordered
        aria-labelledby="package-inclusions-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <BandHeading
          id="package-inclusions-heading"
          eyebrow="Details"
          title="What's included"
          description="Straight from the package record — ask us if anything is unclear."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
            <h3 className="flex items-center gap-2 font-display text-h4 uppercase">
              <BadgeCheck aria-hidden="true" className="size-5" />
              Inclusions
            </h3>
            <div className="mt-4">
              {inclusions.length > 0 ? (
                <BrutalIconList items={inclusions} tone="mint" />
              ) : (
                <p className="text-sm font-medium text-ink-soft">
                  Inclusions will be listed here once they&apos;re added. Enquire and
                  we&apos;ll spell out exactly what&apos;s covered.
                </p>
              )}
            </div>
          </div>

          <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
            <h3 className="flex items-center gap-2 font-display text-h4 uppercase">
              <CircleX aria-hidden="true" className="size-5" />
              Exclusions
            </h3>
            <div className="mt-4">
              {exclusions.length > 0 ? (
                <BrutalIconList items={exclusions} tone="peach" />
              ) : (
                <p className="text-sm font-medium text-ink-soft">
                  Exclusions will be listed here once they&apos;re added. Enquire and
                  we&apos;ll clarify what&apos;s not covered.
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {gallery.length > 0 ? (
        <>
          <SectionDivider variant="stripe" tone="ink" />

          <SectionWrapper
            tone="lavender"
            bordered
            aria-labelledby="package-gallery-heading"
            containerClassName="py-12 sm:py-16 lg:py-20"
          >
            <BandHeading
              id="package-gallery-heading"
              eyebrow="Gallery"
              title={`Photos for ${pkg.title}`}
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <BrutalImage
                  key={`${image.url}-${index}`}
                  src={image.url}
                  alt={image.alt || `${pkg.title} photo ${index + 1}`}
                  aspect="landscape"
                  zoom
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ))}
            </div>
          </SectionWrapper>
        </>
      ) : null}

      {related.length > 0 ? (
        <SectionWrapper
          tone="mint"
          bordered
          aria-labelledby="package-related-heading"
          containerClassName="py-12 sm:py-16 lg:py-20"
        >
          <BandHeading
            id="package-related-heading"
            eyebrow="More trips"
            title={
              pkg.destination ? `More packages in ${pkg.destination.name}` : "More packages"
            }
            description="Other published packages — enquire on any of them for custom dates."
          />

          <div className="mt-8">
            <PackageGrid packages={related} />
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper
        tone="peach"
        bordered
        aria-labelledby="package-review-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="package-review-heading"
          eyebrow="Reviews"
          title="Traveled with us?"
          description="Share your experience — reviews are checked by our team before they appear publicly."
        />

        <div className="mt-8 max-w-3xl">
          <ReviewForm contextLabel="Package (optional)" contextPlaceholder={pkg.title} />
        </div>
      </SectionWrapper>

      <section
        id="package-plan"
        aria-labelledby="package-plan-heading"
        className="relative w-full border-b-[3px] border-ink bg-sky"
      >
        <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-end">
            <div className="md:text-right">
              <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2 md:ml-auto">
                <MapPinned aria-hidden="true" className="size-3.5" />
                Next step
              </span>
              <h2
                id="package-plan-heading"
                className="mt-5 max-w-[18ch] text-h2 md:ml-auto"
              >
                Want this trip?
              </h2>
              <p className="mt-4 max-w-xl text-lead font-medium text-ink-soft md:ml-auto">
                Send an enquiry and we&apos;ll come back with availability, pricing and any
                tweaks to fit your dates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PackageEnquiryButton
                slug={pkg.slug}
                title={pkg.title}
                label="Enquire about this package"
                size="xl"
              />
              <Link
                className={buttonVariants({ variant: "outline", size: "xl" })}
                href="/packages"
              >
                <Compass aria-hidden="true" className="size-4" />
                All packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CompareTray />
    </CompareProvider>
  );
}
