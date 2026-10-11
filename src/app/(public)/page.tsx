import * as React from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { AnnouncementBar } from "@/components/home/announcement-bar";
import { DestinationsSection } from "@/components/home/destinations-section";
import { InternationalTrips } from "@/components/home/international-section";
import { PackagesSection } from "@/components/home/packages-section";
import { ServicesSection } from "@/components/home/services-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { TripTypesSection } from "@/components/home/trip-types-section";
import { DestinationFinder } from "@/components/home/destination-finder";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { GuidesTeaser } from "@/components/home/guides-teaser";
import { ReviewsSection } from "@/components/home/reviews-section";
import { FounderTeaser } from "@/components/home/founder-teaser";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Marquee } from "@/components/shared/marquee";
import {
  SectionDivider,
  type DividerTone,
  type DividerVariant,
} from "@/components/ui/dividers";
import {
  getAnnouncement,
  getSiteSettings,
  getPageContent,
  type AnnouncementShape,
} from "@/lib/data/site";
import { getHomeSections } from "@/lib/data/home-sections";
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

type BandTone =
  | "ink"
  | "lemon"
  | "tomato"
  | "paper"
  | "cream"
  | "sunrise"
  | "mint"
  | "sky"
  | "peach"
  | "lavender"
  | "blush"
  | "sand";

const SECTION_TONES: Record<string, BandTone> = {
  announcement: "tomato",
  hero: "sunrise",
  marquee: "ink",
  domestic: "cream",
  international: "sky",
  featured_packages: "mint",
  why_choose: "blush",
  services: "sand",
  how_it_works: "cream",
  trip_types: "peach",
  destination_finder: "lavender",
  gallery: "paper",
  reviews: "peach",
  guides: "cream",
  founder: "ink",
  faq: "lavender",
  final_cta: "sky",
};

const DIVIDER_VARIANTS: DividerVariant[] = ["torn", "zigzag", "stripe", "thick"];
const DIVIDER_TONES: DividerTone[] = ["ink", "lemon", "tomato"];

function pickDividerTone(previous: BandTone, next: BandTone): DividerTone {
  return (
    DIVIDER_TONES.find((tone) => tone !== previous && tone !== next) ?? "ink"
  );
}

type HomeBands = {
  sections: { key: string; enabled: boolean }[];
  announcement: AnnouncementShape | null;
  hero: {
    title: string;
    subtitle: string;
    instruction: string;
    counts: { destinations: number; packages: number };
    tiles: { src: string; alt: string }[];
  };
};

async function loadHomeBands(): Promise<HomeBands> {
  const [
    sections,
    announcement,
    settings,
    heroContent,
    destinationCount,
    packageResult,
    destinationRows,
  ] = await Promise.all([
    getHomeSections(),
    getAnnouncement(),
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

  const tiles = destinationRows
    .filter((row) => row.image && row.image.trim().length > 0)
    .slice(0, 3)
    .map((row) => ({
      src: row.image as string,
      alt: row.imageAlt?.trim() || row.name,
    }));

  return {
    sections: sections.map(({ key, enabled }) => ({ key, enabled })),
    announcement,
    hero: {
      title,
      subtitle,
      instruction,
      counts: { destinations: destinationCount, packages: packageResult.total },
      tiles,
    },
  };
}

/**
 * Home page — renders the CMS-driven section pipeline. Sections come from
 * `HomeSection` rows (enabled + order); when the table is empty the built-in
 * order from the seed takes over. Divider tones rotate so no two adjacent
 * bands share a background colour.
 */
export default async function HomePage() {
  const { sections, announcement, hero } = await loadHomeBands();

  const renderers: Record<string, () => React.ReactNode> = {
    announcement: () =>
      announcement ? (
        <AnnouncementBar text={announcement.text} link={announcement.link} />
      ) : null,
    hero: () => (
      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        instruction={hero.instruction}
        counts={hero.counts}
        tiles={hero.tiles}
      />
    ),
    marquee: () => <Marquee tone="ink" />,
    domestic: () => <DestinationsSection />,
    international: () => <InternationalTrips />,
    featured_packages: () => <PackagesSection />,
    why_choose: () => <WhyChooseUs />,
    services: () => <ServicesSection />,
    how_it_works: () => <HowItWorks />,
    trip_types: () => <TripTypesSection />,
    destination_finder: () => <DestinationFinder />,
    gallery: () => <GalleryTeaser />,
    reviews: () => <ReviewsSection />,
    guides: () => <GuidesTeaser />,
    founder: () => <FounderTeaser />,
    faq: () => <FaqSection />,
    final_cta: () => <FinalCta />,
  };

  const withWhyChoose = insertWhyChooseSection(sections);

  const bands = withWhyChoose
    .filter(
      (section) =>
        section.enabled &&
        section.key in renderers &&
        (section.key !== "announcement" || Boolean(announcement?.text)),
    )
    .map((section) => ({
      key: section.key,
      tone: SECTION_TONES[section.key] ?? "cream",
      node: renderers[section.key]?.(),
    }));

  return (
    <>
      {bands.map((band, index) => {
        if (index === 0) {
          return (
            <React.Fragment key={band.key}>{band.node}</React.Fragment>
          );
        }
        const previous = bands[index - 1];
        const variant = DIVIDER_VARIANTS[index % DIVIDER_VARIANTS.length];
        const dividerTone = pickDividerTone(previous?.tone ?? "ink", band.tone);
        const flip =
          (variant === "torn" || variant === "zigzag") && index % 2 === 1;

        return (
          <React.Fragment key={band.key}>
            <SectionDivider variant={variant} tone={dividerTone} flip={flip} />
            {band.node}
          </React.Fragment>
        );
      })}
    </>
  );
}

/**
 * "Why choose us" isn't seeded into `HomeSection`, so it is slotted in right
 * after the featured packages band (its position on the original home page).
 * A real `HomeSection` row for the key wins when the admin creates one.
 */
function insertWhyChooseSection(
  sections: { key: string; enabled: boolean }[],
): { key: string; enabled: boolean }[] {
  if (sections.some((section) => section.key === "why_choose")) {
    return sections;
  }
  const anchorIndex = sections.findIndex(
    (section) => section.key === "featured_packages",
  );
  const entry = { key: "why_choose", enabled: true };
  const next = [...sections];
  if (anchorIndex >= 0) {
    next.splice(anchorIndex + 1, 0, entry);
  } else {
    next.push(entry);
  }
  return next;
}
