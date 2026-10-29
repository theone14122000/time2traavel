import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { EmptyState } from "@/components/shared/empty-state";
import { RevealTitle } from "@/components/shared/motion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionDivider } from "@/components/ui/dividers";
import { Stamp } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrutalImage } from "@/components/ui/brutal-image";
import { GradientWord } from "@/components/ui/gradient-word";
import { TeamSection } from "@/components/about/team";
import { ContactBlock } from "@/components/about/contact-block";
import { HeroShapes } from "@/components/about/hero-shapes";
import { PlanSteps } from "@/components/about/plan-steps";
import { ValuesGrid, parseValues } from "@/components/about/values-grid";
import {
  DEFAULT_MAP_EMBED_URL,
  getPageContent,
  getSiteSettings,
} from "@/lib/data/site";
import { getFounder, getPublishedTeam } from "@/lib/data/team";
import { toE164 } from "@/lib/contact";
import { absoluteUrl, cn } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";

const ABOUT_HERO_SUBTITLE_KEY =
  "aboutHeroSubtitle" as (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];
const TEAM_INTRO_KEY =
  "teamIntro" as (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About Us",
    description: `${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}. Meet the team behind our trips.`,
    path: "/about-us",
    noIndex: false,
  });
}

function toParagraphs(body: string | null | undefined): string[] {
  if (!body) return [];
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function pickStoryImage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  for (const key of ["storyImage", "image", "imageUrl"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export default async function AboutUsPage() {
  const [
    settings,
    story,
    mission,
    members,
    heroSubtitleContent,
    teamIntroContent,
    founder,
  ] = await Promise.all([
    getSiteSettings(),
    getPageContent(CONTENT_KEYS.aboutStory),
    getPageContent(CONTENT_KEYS.aboutMission),
    getPublishedTeam(),
    getPageContent(ABOUT_HERO_SUBTITLE_KEY),
    getPageContent(TEAM_INTRO_KEY),
    getFounder(),
  ]);

  const heroSubtitle =
    heroSubtitleContent?.body?.trim() || heroSubtitleContent?.title?.trim() || "";
  const teamIntro =
    teamIntroContent?.body?.trim() || teamIntroContent?.title?.trim() || "";

  const storyTitle = story?.title?.trim() || "";
  const storyParagraphs = toParagraphs(story?.body);
  const storyImage = pickStoryImage(story?.data);
  const hasStory = Boolean(storyTitle || storyParagraphs.length > 0 || storyImage);

  const missionTitle = mission?.title?.trim() || "";
  const missionParagraphs = toParagraphs(mission?.body);
  const values = parseValues(mission?.data);
  const hasValues = Boolean(missionTitle || missionParagraphs.length > 0 || values);

  const telephone = toE164(settings.phone) ?? "+919882726990";

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about-us" },
  ]);

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TravelAgency"],
    name: settings.siteName,
    url: absoluteUrl("/about-us"),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kasumpti",
      addressLocality: "Shimla",
      addressRegion: "Himachal Pradesh",
      addressCountry: "IN",
      description: settings.address,
    },
    telephone,
    ...(settings.email ? { email: settings.email } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone,
    },
    ...(founder
      ? { founder: { "@type": "Person", name: founder.name } }
      : {}),
  };

  return (
    <>
      <SectionWrapper
        tone="butter"
        bordered
        className="overflow-hidden scroll-mt-24"
        containerClassName="relative"
        aria-labelledby="about-hero-heading"
      >
        <HeroShapes />
        <div className="relative z-10 py-10 sm:py-14 lg:py-16">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
          />

          <div className="relative mt-8">
            <Stamp
              variant="tomato"
              rotate={9}
              className="absolute -top-4 right-0 hidden sm:inline-flex"
            >
              Based in Shimla
            </Stamp>

            <span className="label-brutal inline-flex w-fit items-center gap-2 border border-line bg-paper px-3 py-2 shadow-hard-xs">
              {SITE_IDENTITY.name}
            </span>

            <h1
              id="about-hero-heading"
              className="mt-5 max-w-[14ch] font-display text-display uppercase"
            >
              About <GradientWord tone="ink">Us</GradientWord>
            </h1>

            {heroSubtitle ? (
              <p className="mt-5 max-w-2xl text-lead font-medium text-ink-soft">
                {heroSubtitle}
              </p>
            ) : null}
          </div>
        </div>
      </SectionWrapper>

      <SectionDivider variant="zigzag" tone="tomato" flip />

      {hasStory ? (
        <SectionWrapper
          tone="paper"
          bordered
          id="story"
          className="scroll-mt-24"
          aria-labelledby="story-heading"
        >
          <div
            className={cn(
              "grid gap-8 py-12 sm:py-16 lg:gap-12 lg:py-20",
              storyImage && "lg:grid-cols-2 lg:items-center",
            )}
          >
            <div className="max-w-3xl">
              <SectionHeading
                id="story-heading"
                eyebrow="Our story"
                title={
                  <RevealTitle as="span" className="block">
                    {storyTitle || "Our story"}
                  </RevealTitle>
                }
              />

              {storyParagraphs.length > 0 ? (
                <div className="brutal-prose mt-6">
                  {storyParagraphs.map((paragraph, index) => (
                    <p key={`story-${index}`}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </div>

            {storyImage ? (
              <BrutalImage
                src={storyImage}
                alt={storyTitle || "Our story"}
                aspect="landscape"
                sizes="(max-width: 1024px) 92vw, 44vw"
                zoom={false}
                className="shadow-brutal-lg"
              />
            ) : null}
          </div>
        </SectionWrapper>
      ) : null}

      <SectionDivider variant="torn" tone="ink" />

      <SectionWrapper
        tone="mint"
        bordered
        id="team"
        className="scroll-mt-24"
        aria-labelledby="team-heading"
      >
        <div className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="team-heading"
            eyebrow="Our team"
            title={
              <RevealTitle as="span" className="block">
                Meet the team
              </RevealTitle>
            }
            description={teamIntro || undefined}
          />

          {members.length === 0 ? (
            <div className="mt-8 max-w-xl">
              <EmptyState
                eyebrow="Managed from admin"
                title="Team profiles coming soon"
                description="Profiles published from the admin panel will appear here."
                tone="paper"
                illustration="luggage"
                icon={<Users aria-hidden="true" className="size-8" />}
                className="py-8"
              />
            </div>
          ) : (
            <div className="mt-10">
              <TeamSection members={members} />
            </div>
          )}
        </div>
      </SectionWrapper>

      <SectionDivider variant="stripe" tone="lemon" />

      {hasValues ? (
        <SectionWrapper
          tone="lavender"
          bordered
          id="values"
          className="scroll-mt-24"
          aria-labelledby="values-heading"
        >
          <div className="py-12 sm:py-16 lg:py-20">
            <SectionHeading
              id="values-heading"
              eyebrow="Mission & values"
              title={
                <RevealTitle as="span" className="block">
                  {missionTitle || "Mission and values"}
                </RevealTitle>
              }
            />

            {missionParagraphs.length > 0 ? (
              <div className="brutal-prose mt-6 max-w-3xl">
                {missionParagraphs.map((paragraph, index) => (
                  <p key={`mission-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {values ? <ValuesGrid values={values} /> : null}
          </div>
        </SectionWrapper>
      ) : null}

      <SectionDivider variant="thick" tone="paper" />

      <SectionWrapper
        tone="butter"
        bordered
        className="scroll-mt-24 bg-sunrise"
        aria-labelledby="plan-heading"
      >
        <div className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="plan-heading"
            eyebrow="Plan with us"
            title={
              <RevealTitle as="span" className="block">
                How we plan your trip
              </RevealTitle>
            }
            description="The same four steps whether you're booking a weekend break or a multi-stop trip."
          />
          <PlanSteps />
        </div>
      </SectionWrapper>

      <SectionDivider variant="zigzag" tone="ink" />

      <SectionWrapper
        tone="cream"
        bordered
        id="contact"
        className="scroll-mt-24"
        aria-labelledby="contact-heading"
      >
        <div className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="contact-heading"
            eyebrow="Contact"
            title={
              <RevealTitle as="span" className="block">
                Talk to us
              </RevealTitle>
            }
            description="Send an enquiry below, or reach us directly — whichever suits you."
          />

          <ContactBlock
            phone={settings.phone}
            whatsapp={settings.whatsapp}
            email={settings.email}
            supportPhone={settings.supportPhone}
            address={settings.address}
            workingHours={settings.workingHours}
            mapEmbedUrl={settings.mapEmbedUrl ?? DEFAULT_MAP_EMBED_URL}
          />
        </div>
      </SectionWrapper>

      <SectionDivider variant="torn" tone="lemon" flip />

      <SectionWrapper tone="ink" bordered gridLines>
        <div className="flex flex-col items-center gap-5 py-14 text-center sm:py-16 lg:py-20">
          <span className="label-brutal w-fit border border-line bg-lemon px-3 py-2 text-ink">
            Plan my trip
          </span>
          <h2
            id="about-cta-heading"
            className="max-w-[18ch] text-h2 text-cream"
          >
            Let&apos;s plan your next <GradientWord tone="onDark">trip</GradientWord>
          </h2>
          <p className="max-w-xl text-lead font-medium text-butter">
            Tell us where you&apos;d like to go, when, and who&apos;s travelling —
            we&apos;ll take it from there.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/plan-my-trip">Plan My Trip</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/about-us#contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </SectionWrapper>

      <JsonLd data={breadcrumb} />
      <JsonLd data={localBusiness} />
    </>
  );
}
