import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, MapPin, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { RevealTitle } from "@/components/shared/motion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionDivider } from "@/components/ui/dividers";
import { BrutalCard, BrutalCardBody } from "@/components/ui/brutal-card";
import { Stamp } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanTripButton } from "@/components/about/plan-trip-button";
import { Timeline, parseMilestones } from "@/components/about/timeline";
import { ValuesGrid, parseValues } from "@/components/about/values-grid";
import { getPageContent, getSiteSettings, getWhyChooseItems } from "@/lib/data/site";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About Us",
    description: `${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}.`,
    path: "/about",
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

function BodyProse({ body }: { body: string | null | undefined }) {
  const paragraphs = toParagraphs(body);
  if (paragraphs.length === 0) return null;
  return (
    <div className="brutal-prose mt-6 max-w-3xl">
      {paragraphs.map((paragraph, index) => (
        <p key={`paragraph-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Eyebrow + masked slide-up heading, kept in sync with `SectionHeading`. */
function SectionTitle({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <SectionHeading
      id={id}
      eyebrow={eyebrow}
      title={<RevealTitle as="span" className="block">{title}</RevealTitle>}
      description={description}
    />
  );
}

function PageBreadcrumbs({ current }: { current: string }) {
  return (
    <div className="w-full border-b-[3px] border-ink bg-paper">
      <Container className="py-3">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: current }]} />
      </Container>
    </div>
  );
}

export default async function AboutPage() {
  const [settings, story, mission, founder, whyChooseItems] = await Promise.all([
    getSiteSettings(),
    getPageContent(CONTENT_KEYS.aboutStory),
    getPageContent(CONTENT_KEYS.aboutMission),
    getPageContent(CONTENT_KEYS.aboutFounder),
    getWhyChooseItems(),
  ]);

  const milestones = parseMilestones(story?.data);
  const values = parseValues(mission?.data);
  const storyParagraphs = toParagraphs(story?.body);
  const missionParagraphs = toParagraphs(mission?.body);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <>
      <PageBreadcrumbs current="About" />

      <PageHeader
        eyebrow="About us"
        title={`About ${SITE_IDENTITY.name}`}
        description={`A travel agency based in ${SITE_IDENTITY.address}. Everything on this page is written and published by our team.`}
      />

      <SectionWrapper tone="paper" bordered gridLines aria-labelledby="about-story-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionTitle
            id="about-story-heading"
            eyebrow="Our story"
            title={story?.title?.trim() || "Our story"}
          />
          {storyParagraphs.length > 0 ? (
            <BodyProse body={story?.body} />
          ) : (
            <div className="mt-8 max-w-3xl">
              <EmptyState
                eyebrow="From the admin"
                title="Our story is being written"
                description="This section is managed from the admin panel and will appear here once published."
                tone="butter"
                illustration="map"
                icon={<BookOpen className="size-8" aria-hidden="true" />}
              />
            </div>
          )}
        </Reveal>
      </SectionWrapper>

      {milestones ? (
        <SectionWrapper tone="sand" bordered aria-labelledby="about-timeline-heading">
          <Reveal className="py-12 sm:py-16 lg:py-20">
            <SectionTitle
              id="about-timeline-heading"
              eyebrow="Milestones"
              title="How we got here"
              description="Published from the admin panel as structured milestones — a year, a moment and the note that goes with it."
            />
            <Timeline milestones={milestones} />
          </Reveal>
        </SectionWrapper>
      ) : null}

      <SectionWrapper tone="mint" bordered aria-labelledby="about-mission-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionTitle
            id="about-mission-heading"
            eyebrow="Mission"
            title={mission?.title?.trim() || "Our mission"}
          />
          {values ? (
            <>
              {missionParagraphs.length > 0 ? <BodyProse body={mission?.body} /> : null}
              <ValuesGrid values={values} />
            </>
          ) : missionParagraphs.length > 0 ? (
            <BodyProse body={mission?.body} />
          ) : (
            <div className="mt-8 max-w-3xl">
              <EmptyState
                eyebrow="From the admin"
                title="Mission — coming soon"
                description="Our mission statement will appear here once it's published from the admin panel."
                tone="paper"
                illustration="compass"
                icon={<Target className="size-8" aria-hidden="true" />}
              />
            </div>
          )}
        </Reveal>
      </SectionWrapper>

      <SectionWrapper tone="peach" bordered aria-labelledby="about-founder-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionTitle
            id="about-founder-heading"
            eyebrow="Founder"
            title={SITE_IDENTITY.founder}
            description={founder?.title?.trim() || undefined}
          />
          <BrutalCard
            variant="info"
            disableHover
            className="mt-8 max-w-3xl bg-paper shadow-brutal-md"
            sticker={
              <Stamp variant="tomato" rotate={-8}>
                {SITE_IDENTITY.founder}
              </Stamp>
            }
          >
            <BrutalCardBody className="space-y-4 p-6 pt-10 sm:p-8 sm:pt-11">
              <BodyProse body={founder?.body ?? null} />
              {toParagraphs(founder?.body).length === 0 ? (
                <p className="text-sm font-medium leading-relaxed text-ink-soft">
                  A note from {SITE_IDENTITY.founder} will appear here once it&apos;s
                  published from the admin panel.
                </p>
              ) : null}
            </BrutalCardBody>
          </BrutalCard>
        </Reveal>
      </SectionWrapper>

      <SectionWrapper tone="sky" bordered aria-labelledby="about-office-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionTitle
            id="about-office-heading"
            eyebrow="Our office"
            title="Where to find us"
            description="Our office address comes straight from our verified business details."
          />
          <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="border-[3px] border-ink bg-paper p-5 shadow-brutal-md">
              <p className="label-brutal text-ink-soft">Address</p>
              <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-relaxed">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {settings.address}
              </p>
            </div>
            {settings.workingHours ? (
              <div className="border-[3px] border-ink bg-paper p-5 shadow-brutal-md">
                <p className="label-brutal text-ink-soft">Working hours</p>
                <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-relaxed">
                  <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {settings.workingHours}
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </Reveal>
      </SectionWrapper>

      <SectionWrapper tone="lavender" bordered aria-labelledby="about-why-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionTitle
            id="about-why-heading"
            eyebrow="Why choose us"
            title="What we put into every trip"
            description="Written by our team from the admin panel — no stock claims, no invented numbers."
          />
          <div className="mt-8">
            {whyChooseItems.length === 0 ? (
              <EmptyState
                eyebrow="Managed from admin"
                title="Why choose us — coming soon"
                description="Our reasons to travel with Time to Travel will appear here once published."
                tone="paper"
                illustration="search"
                icon={<Users className="size-8" aria-hidden="true" />}
              />
            ) : (
              <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {whyChooseItems.map((item, index) => (
                  <StaggerItem key={`${item.title}-${index}`} className="h-full">
                    <article className="relative h-full border-[3px] border-ink bg-paper p-5 shadow-brutal-md transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg sm:p-6">
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 left-5 flex size-9 items-center justify-center border-[3px] border-ink bg-lemon font-display text-sm"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 font-display text-h4 uppercase leading-tight">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-relaxed text-ink-soft">
                        {item.description}
                      </p>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </div>
        </Reveal>
      </SectionWrapper>

      <SectionDivider variant="zigzag" tone="ink" />

      <SectionWrapper tone="ink" bordered gridLines aria-labelledby="about-cta-heading">
        <div className="flex flex-col items-center gap-5 py-14 text-center sm:py-16 lg:py-20">
          <span className="label-brutal w-fit border-[3px] border-ink bg-lemon px-3 py-2 text-ink">
            Plan my trip
          </span>
          <div id="about-cta-heading">
            <RevealTitle
              as="h2"
              className="max-w-[18ch] font-display text-h2 uppercase"
            >
              Let&apos;s plan your next trip
            </RevealTitle>
          </div>
          <p className="max-w-xl text-lead font-medium text-butter">
            Tell us where you&apos;d like to go, when, and who&apos;s travelling — we&apos;ll
            take it from there.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <PlanTripButton />
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </SectionWrapper>

      <JsonLd data={breadcrumb} />
    </>
  );
}
