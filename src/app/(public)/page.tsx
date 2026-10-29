import * as React from "react";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { AnnouncementBar } from "@/components/home/announcement-bar";
import { DestinationsSection } from "@/components/home/destinations-section";
import { MountainsBand } from "@/components/home/mountains-band";
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
import { getHeroTileFallbacks } from "@/lib/home-fallback-images";
import { getHeroSlides } from "@/lib/hero-slides";
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
import { getFounder } from "@/lib/data/team";
import { buildMetadata } from "@/lib/seo";
import { CONTENT_KEYS } from "@/lib/constants";

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
  announcement: "ink",
  hero: "cream",
  marquee: "ink",
  domestic: "cream",
  mountains: "ink",
  international: "sky",
  featured_packages: "paper",
  why_choose: "peach",
  services: "sand",
  how_it_works: "mint",
  trip_types: "lavender",
  destination_finder: "sand",
  gallery: "paper",
  reviews: "sky",
  guides: "cream",
  founder: "ink",
  faq: "mint",
  final_cta: "ink",
};

type HomeBands = {
  sections: { key: string; enabled: boolean }[];
  announcement: AnnouncementShape | null;
  hero: {
    title: string;
    subtitle: string;
    instruction: string;
    counts: { destinations: number; packages: number };
    tiles: { src: string; alt: string }[];
    backgroundSlides: { src: string; alt: string; label: string }[];
    founderName: string | null;
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
    founder,
  ] = await Promise.all([
    getHomeSections(),
    getAnnouncement(),
    getSiteSettings(),
    getPageContent(CONTENT_KEYS.homeHero),
    countPublishedDestinations(),
    getPackages({ sort: "popular", page: 1, pageSize: 1 }),
    getPublishedDestinations({ limit: 6 }),
    getFounder(),
  ]);

  const heroData =
    heroContent?.data && typeof heroContent.data === "object"
      ? (heroContent.data as { instruction?: string })
      : {};

  const title =
    settings.heroTitle?.trim() ||
    heroContent?.title?.trim() ||
    "Your next trip starts here.";

  const subtitle =
    settings.heroSubtitle?.trim() ||
    heroContent?.body?.trim() ||
    "Tell us where you want to go, when, and with whom. We'll plan the rest.";

  const instruction = heroData.instruction?.trim() || "Start here —";

  const tiles = destinationRows
    .filter((row) => row.image && row.image.trim().length > 0)
    .slice(0, 3)
    .map((row) => ({
      src: row.image as string,
      alt: row.imageAlt?.trim() || row.name,
    }));

  // Fallback tiles from local image library when DB has no destination images.
  const finalTiles =
    tiles.length >= 2
      ? tiles
      : [
          ...tiles,
          ...getHeroTileFallbacks()
            .slice(0, 2 - tiles.length)
            .map((img) => ({ src: img.src, alt: img.alt })),
        ];

  // Hero background slides: the five curated photographs in
  // /public/images/hero (slide-1 … slide-5).
  const backgroundSlides = getHeroSlides();

  return {
    sections: sections.map(({ key, enabled }) => ({ key, enabled })),
    announcement,
    hero: {
      title,
      subtitle,
      instruction,
      counts: { destinations: destinationCount, packages: packageResult.total },
      tiles: finalTiles,
      backgroundSlides,
      founderName: founder?.name ?? null,
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
      <CinematicHero slides={hero.backgroundSlides} counts={hero.counts} />
    ),
    marquee: () => null,
    domestic: () => <DestinationsSection />,
    mountains: () => <MountainsBand />,
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

  const withWhyChoose = insertSectionAfter(
    insertSectionAfter(sections, "featured_packages", "why_choose"),
    "domestic",
    "mountains",
  );

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
      {bands.map((band) => (
        <React.Fragment key={band.key}>{band.node}</React.Fragment>
      ))}
    </>
  );
}

/**
 * Splices a built-in section into the CMS-driven order when no `HomeSection`
 * row exists for that key. A real admin-created row always wins.
 */
function insertSectionAfter(
  sections: { key: string; enabled: boolean }[],
  anchorKey: string,
  entryKey: string,
): { key: string; enabled: boolean }[] {
  if (sections.some((section) => section.key === entryKey)) {
    return sections;
  }
  const anchorIndex = sections.findIndex(
    (section) => section.key === anchorKey,
  );
  const entry = { key: entryKey, enabled: true };
  const next = [...sections];
  if (anchorIndex >= 0) {
    next.splice(anchorIndex + 1, 0, entry);
  } else {
    next.push(entry);
  }
  return next;
}
