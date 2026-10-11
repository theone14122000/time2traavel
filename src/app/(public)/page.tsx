import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { DestinationsSection } from "@/components/home/destinations-section";
import { PackagesSection } from "@/components/home/packages-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { ReviewsSection } from "@/components/home/reviews-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Marquee } from "@/components/shared/marquee";
import { SectionDivider } from "@/components/ui/dividers";
import { getSiteSettings, getPageContent } from "@/lib/data/site";
import {
  countPublishedDestinations,
  getPublishedDestinations,
} from "@/lib/data/destinations";
import { getPackages } from "@/lib/data/packages";
import { buildMetadata } from "@/lib/seo";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata({
    title: settings.metaTitle ?? "Plan Your Next Trip",
    description: settings.metaDescription,
    path: "/",
    image: settings.ogImage,
  });
}

export default async function HomePage() {
  const [settings, heroContent, destinationCount, packageResult, destinationRows] =
    await Promise.all([
      getSiteSettings(),
      getPageContent(CONTENT_KEYS.homeHero),
      countPublishedDestinations(),
      getPackages({ sort: "popular", page: 1, pageSize: 1 }),
      getPublishedDestinations({ limit: 6 }),
    ]);

  const heroData =
    heroContent?.data && typeof heroContent.data === "object"
      ? (heroContent.data as { instruction?: string })
      : {};

  const title =
    settings.heroTitle?.trim() ||
    heroContent?.title?.trim() ||
    "Plan your next trip";

  const subtitle =
    settings.heroSubtitle?.trim() ||
    heroContent?.body?.trim() ||
    `${SITE_IDENTITY.name} is a travel agency based in ${SITE_IDENTITY.address}. Tell us your destination, dates and travellers — we'll take it from there.`;

  const instruction = heroData.instruction?.trim() || "Start here —";

  // Hero visual tiles: real published destination images only (max 3).
  // When none exist the hero renders SVG placeholder tiles instead.
  const tiles = destinationRows
    .filter((row) => row.image && row.image.trim().length > 0)
    .slice(0, 3)
    .map((row) => ({
      src: row.image,
      alt: row.imageAlt?.trim() || row.name,
    }));

  return (
    <>
      <Hero
        title={title}
        subtitle={subtitle}
        instruction={instruction}
        counts={{ destinations: destinationCount, packages: packageResult.total }}
        tiles={tiles}
      />

      <Marquee tone="ink" />

      <SectionDivider variant="torn" tone="ink" flip />
      <DestinationsSection />

      <SectionDivider variant="zigzag" tone="lemon" />
      <PackagesSection />

      <SectionDivider variant="stripe" tone="tomato" />
      <WhyChooseUs />

      <SectionDivider variant="thick" tone="ink" />
      <ReviewsSection />

      <SectionDivider variant="torn" tone="lemon" />
      <FaqSection />

      <SectionDivider variant="zigzag" tone="tomato" />
      <FinalCta />
    </>
  );
}
