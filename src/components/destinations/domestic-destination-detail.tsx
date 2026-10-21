import Link from "next/link";
import { notFound } from "next/navigation";
import { Sun } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionWrapper } from "@/components/shared/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { DomesticDestinationsGrid } from "@/components/destinations/domestic-destinations-grid";
import { DestinationHeroGallery } from "@/components/destinations/destination-hero-gallery";
import { DestinationPhotoGallery } from "@/components/destinations/destination-photo-gallery";
import { DestinationEnquiryButton } from "@/components/destinations/destination-enquiry";
import { PackageGrid } from "@/components/packages/package-grid";
import { getDomesticDestinationBySlug, getDomesticDestinations } from "@/lib/data/domestic-destinations";
import { getContactDetails } from "@/lib/data/site";
import { getPackagesByDestination } from "@/lib/data/packages";
import { originalUrl } from "@/lib/domestic-destinations";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/lib/seo";

type Props = { slug: string };

export async function DomesticDestinationDetail({ slug }: Props) {
  const destination = await getDomesticDestinationBySlug(slug);
  if (!destination) notFound();

  const all = await getDomesticDestinations();
  const others = all.filter((d) => d.slug !== destination.slug);

  const images = destination.images.map((file, i) => ({
    src: originalUrl(file),
    alt: `${destination.name} travel photo ${i + 1}`,
  }));

  const cover =
    destination.images[
      Math.min(destination.coverIndex, destination.images.length - 1)
    ] ?? destination.images[0];

  const contact = await getContactDetails();
  const related = destination.dbId
    ? await getPackagesByDestination(destination.dbId, 4)
    : [];

  const whatsappUrl = contact.whatsappUrl;
  const phoneHref = contact.phoneHref;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: destination.name,
          description: destination.overview,
          image: cover ? absoluteUrl(originalUrl(cover)) : undefined,
        }}
      />
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              { label: destination.name },
            ]}
          />
        </Container>
      </div>

      <DestinationHeroGallery
        images={images}
        title={destination.name}
        tagline={destination.tagline}
      />

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="quick-facts-heading"
        containerClassName="py-10 sm:py-14"
      >
        <h2 id="quick-facts-heading" className="sr-only">
          Quick facts
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="dark" size="lg">
            Domestic
          </Badge>
          <Badge variant="soft" size="lg">
            {destination.bestTime}
          </Badge>
          {destination.knownFor.slice(0, 4).map((item) => (
            <Badge key={item} variant="outline" size="md">
              {item}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-xs font-medium text-ink-soft">
          General guidance only. Weather and conditions vary by region and year; our team can help you choose the right time.
        </p>
      </SectionWrapper>

      <SectionWrapper
        tone="paper"
        bordered
        aria-labelledby="overview-heading"
        containerClassName="py-12 sm:py-16"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            <h2 id="overview-heading" className="font-display text-h2 uppercase">
              Overview
            </h2>
            <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-ink-soft">
              {destination.overview}
            </p>

            <h3 className="mt-8 font-display text-h4 uppercase">Known for</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {destination.knownFor.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 border-[2px] border-ink bg-paper px-3 py-2 text-sm font-medium"
                >
                  <span aria-hidden="true" className="size-2 bg-ink" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <DestinationEnquiryButton
                slug={destination.slug}
                name={destination.name}
                label="Enquire about this destination"
                size="lg"
              />
              <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/destinations">
                All destinations
              </Link>
            </div>
          </div>

          <aside className="grid content-start gap-6">
            <div className="border-4 border-ink bg-mint p-5 shadow-brutal-md">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="flex size-9 items-center justify-center border-[3px] border-ink bg-paper">
                  <Sun className="size-4" />
                </span>
                <h3 className="font-display text-h4 uppercase">Best time to visit</h3>
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed sm:text-base">
                {destination.bestTime}
              </p>
              <p className="mt-2 text-xs font-medium text-ink-soft">
                General guidance only. Weather and conditions vary by region and year; our team can help you choose the right time.
              </p>
            </div>

            <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
              <h3 className="font-display text-h4 uppercase">Plan this trip</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink-soft">
                Send your dates, group size and any must-dos — we&apos;ll reply with a plan built around {destination.name}.
              </p>
              <DestinationEnquiryButton
                slug={destination.slug}
                name={destination.name}
                label="Start an enquiry"
                size="md"
                className="mt-4 w-full"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    WhatsApp
                  </a>
                ) : null}
                {phoneHref ? (
                  <a href={phoneHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Call
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      <SectionWrapper
        tone="butter"
        bordered
        aria-labelledby="gallery-heading"
        containerClassName="py-12 sm:py-16"
      >
        <h2 id="gallery-heading" className="font-display text-h2 uppercase">
          Photo gallery
        </h2>
        <p className="mt-2 text-sm font-medium text-ink-soft">
          {destination.name} travel photos.
        </p>
        <div className="mt-6">
          <DestinationPhotoGallery images={images} />
        </div>
      </SectionWrapper>

      {related.length > 0 ? (
        <SectionWrapper
          tone="sky"
          bordered
          aria-labelledby="packages-heading"
          containerClassName="py-12 sm:py-16"
        >
          <h2 id="packages-heading" className="font-display text-h2 uppercase">
            Trips covering {destination.name}
          </h2>
          <div className="mt-6">
            <PackageGrid packages={related} />
          </div>
        </SectionWrapper>
      ) : null}

      <SectionWrapper
        tone="cream"
        bordered
        aria-labelledby="more-heading"
        containerClassName="py-12 sm:py-16"
      >
        <h2 id="more-heading" className="font-display text-h2 uppercase">
          Explore more destinations
        </h2>
        <div className="mt-6">
          <DomesticDestinationsGrid destinations={others} />
        </div>
      </SectionWrapper>
    </>
  );
}
