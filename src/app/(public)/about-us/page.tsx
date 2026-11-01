import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Mountain, Sparkles, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CountUp } from "@/components/shared/motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { TeamSection } from "@/components/about/team";
import { ContactBlock } from "@/components/about/contact-block";
import { PlanSteps } from "@/components/about/plan-steps";
import { PlanTripButton } from "@/components/about/plan-trip-button";
import { ValuesGrid, parseValues } from "@/components/about/values-grid";
import { Leadership } from "@/components/about/leadership";
import { HappyTravellers } from "@/components/about/happy-travellers";
import { PhotoPlaceholder } from "@/components/about/photo-placeholder";
import { DEFAULT_MAP_EMBED_URL, getPageContent, getSiteSettings } from "@/lib/data/site";
import { getFounder, getPublishedTeam } from "@/lib/data/team";
import { getApprovedReviews } from "@/lib/data/reviews";
import { getDomesticDestinations } from "@/lib/data/domestic-destinations";
import { renderHeading } from "@/lib/render-heading";
import { toE164 } from "@/lib/contact";
import { absoluteUrl } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";
import daySunrise from "@/assets/brand/day-sunrise.jpg";
import dayMidday from "@/assets/brand/day-midday.jpg";

const ABOUT_HERO_SUBTITLE_KEY =
  "aboutHeroSubtitle" as (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];
const TEAM_INTRO_KEY =
  "teamIntro" as (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];

const DEFAULT_SUBTITLE =
  "Time2Travel is a Shimla-based travel agency with more than three years of experience planning Himalayan treks, family holidays and island escapes — every one built around the people travelling.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "About Us",
    description: `${SITE_IDENTITY.name} — a travel agency based in ${SITE_IDENTITY.address} with more than three years of experience. Meet the team, hear why travellers love us and get in touch.`,
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

const DEFAULT_VALUES = [
  { title: "Honest advice", text: "We tell you what suits the season, the group and the budget — including what to skip." },
  { title: "Personal planning", text: "Every itinerary is shaped around the people travelling, never copied from a template." },
  { title: "Himalayan roots", text: "Based in Shimla, we plan the mountains with the familiarity of people who live beside them." },
  { title: "Care that lasts", text: "From the first message to the day you are back home, you always know who to call." },
] as const;

export default async function AboutUsPage() {
  const [settings, story, mission, members, heroSubtitleContent, teamIntroContent, founder, reviews, destinations] =
    await Promise.all([
      getSiteSettings(),
      getPageContent(CONTENT_KEYS.aboutStory),
      getPageContent(CONTENT_KEYS.aboutMission),
      getPublishedTeam(),
      getPageContent(ABOUT_HERO_SUBTITLE_KEY),
      getPageContent(TEAM_INTRO_KEY),
      getFounder(),
      getApprovedReviews(3),
      getDomesticDestinations(),
    ]);

  const heroSubtitle =
    heroSubtitleContent?.body?.trim() || heroSubtitleContent?.title?.trim() || DEFAULT_SUBTITLE;
  const teamIntro = teamIntroContent?.body?.trim() || teamIntroContent?.title?.trim() || "";

  const storyTitle = story?.title?.trim() || "";
  const storyParagraphs = toParagraphs(story?.body);
  const hasStory = Boolean(storyTitle || storyParagraphs.length > 0);

  const missionParagraphs = toParagraphs(mission?.body);
  const values = parseValues(mission?.data);

  // Everyone beyond the founder shows in the "wider team" grid when published from the admin.
  const otherMembers = members.filter((member) => !member.isFounder);

  const telephone = toE164(settings.phone) ?? "+918351823736";

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
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone },
    ...(founder ? { founder: { "@type": "Person", name: founder.name } } : {}),
  };

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative overflow-hidden border-b border-line bg-cream"
      >
        <div aria-hidden="true" className="about-aurora absolute inset-0" />
        <div className="lux-container relative pb-16 pt-6 sm:pb-20 lg:pb-24">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <Reveal>
                <p className="lux-eyebrow">About Time2Travel</p>
                <h1 id="about-hero-heading" className="mt-5 font-display text-h1 text-ink">
                  {renderHeading("Journeys planned by people who [[care]].", "ocean")}
                </h1>
                <p className="mt-6 max-w-xl text-lead text-ink-soft">{heroSubtitle}</p>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <PlanTripButton />
                  <a
                    href="#contact"
                    className="inline-flex h-14 items-center gap-2 rounded-full border border-line-strong bg-paper px-8 text-base font-semibold text-ink transition-colors hover:border-ink"
                  >
                    Contact us
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Experience</dt>
                    <dd className="mt-1 font-display text-4xl text-ink">
                      <CountUp value={3} suffix="+" /> <span className="text-xl">yrs</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Destinations</dt>
                    <dd className="mt-1 font-display text-4xl text-ink">
                      <CountUp value={destinations.length} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Home base</dt>
                    <dd className="mt-2 font-display text-2xl leading-tight text-ink">Shimla</dd>
                  </div>
                </dl>
              </Reveal>
            </div>

            {/* Photo collage: real photography + labelled placeholders */}
            <Reveal delay={0.1} className="lg:col-span-6">
              <div className="relative mx-auto grid max-w-xl grid-cols-6 grid-rows-6 gap-4" style={{ aspectRatio: "1 / 1.02" }}>
                <figure className="card-shine group relative col-span-4 col-start-1 row-span-4 row-start-1 overflow-hidden rounded-[2rem] border border-line shadow-hard-lg">
                  <Image
                    src={daySunrise}
                    alt="Sunrise lighting the snow-covered Himalayan peaks above Shimla's mountains"
                    fill
                    sizes="(max-width: 1024px) 70vw, 32vw"
                    priority
                    unoptimized
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-ink/75 px-4 py-2.5 text-white backdrop-blur-md">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin aria-hidden="true" className="size-4 text-gold" /> Kasumpti, Shimla
                    </p>
                    <p className="mt-0.5 text-xs text-white/75">Himachal Pradesh, India</p>
                  </div>
                </figure>
                <figure className="card-shine group relative col-span-2 col-start-5 row-span-3 row-start-1 overflow-hidden rounded-3xl border border-line shadow-hard">
                  <Image
                    src={dayMidday}
                    alt="Snow-covered Himalayan ridge under a clear blue sky"
                    fill
                    sizes="(max-width: 1024px) 30vw, 14vw"
                    unoptimized
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </figure>
                <div className="col-span-3 col-start-1 row-span-2 row-start-5 overflow-hidden rounded-3xl border border-line shadow-hard">
                  <PhotoPlaceholder label="Our team" />
                </div>
                <div className="col-span-3 col-start-4 row-span-3 row-start-4 overflow-hidden rounded-3xl border border-line shadow-hard">
                  <PhotoPlaceholder label="Happy traveller" />
                </div>

              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ──────────────── Experience banner ──────────────── */}
      <section aria-labelledby="experience-heading" className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden="true" className="about-stars absolute inset-0 opacity-60" />
        <div className="lux-container lux-section relative">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <p className="lux-eyebrow text-[#e6cf9f]">Our experience</p>
              <h2 id="experience-heading" className="mt-4 font-display text-h2 text-white">
                {renderHeading("More than three years of [[journeys]]", "onDark")}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-lg leading-relaxed text-white/80">
                Over more than three years of planning trips, we have learned that a good journey is made of
                small, well-handled details — a pickup that is on time, a stay that fits, a plan that changes
                gracefully when the weather does. That experience goes into every itinerary we build, whether
                it is a weekend in the hills or a multi-stop holiday.
              </p>
              <StaggerGroup className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { Icon: Mountain, big: "3+", label: "years of planning trips" },
                  { Icon: Users, big: "1:1", label: "personal planning, not templates" },
                  { Icon: Sparkles, big: String(destinations.length), label: "Indian destinations featured" },
                ].map(({ Icon, big, label }) => (
                  <StaggerItem key={label}>
                    <div className="card-shine h-full rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-gold/60 hover:bg-white/10">
                      <Icon aria-hidden="true" className="size-5 text-gold" />
                      <p className="mt-3 font-display text-4xl text-white">{big}</p>
                      <p className="mt-1 text-sm text-white/70">{label}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── Story (admin-managed, shown when published) ───────── */}
      {hasStory ? (
        <section id="story" aria-labelledby="story-heading" className="lux-section scroll-mt-24 bg-cream">
          <div className="lux-container">
            <Reveal className="mx-auto max-w-3xl">
              <p className="lux-eyebrow">Our story</p>
              <h2 id="story-heading" className="mt-4 font-display text-h2 text-ink">
                {renderHeading(storyTitle || "How Time2Travel [[began]]", "forest")}
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
                {storyParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ───────────────────── Leadership ───────────────────── */}
      <section id="team" aria-labelledby="team-heading" className="lux-section scroll-mt-24 bg-sand/60">
        <div className="lux-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="lux-eyebrow justify-center">Leadership</p>
            <h2 id="team-heading" className="mt-4 font-display text-h2 text-ink">
              {renderHeading("The people behind your [[journey]]", "ocean")}
            </h2>
            <p className="mt-4 text-lead text-ink-soft">
              {teamIntro || "A small senior team, each owning a part of your experience from the first message to the day you are home."}
            </p>
          </Reveal>

          <div className="mt-12">
            <Leadership ceoName={founder?.name ?? null} />
          </div>

          {otherMembers.length > 0 ? (
            <div className="mt-16">
              <h3 className="mb-6 text-center font-display text-h3 text-ink">The wider team</h3>
              <TeamSection members={otherMembers} />
            </div>
          ) : null}
        </div>
      </section>

      {/* ───────────────────── Happy travellers ───────────────────── */}
      <section id="travellers" aria-labelledby="happy-heading" className="lux-section scroll-mt-24 overflow-hidden bg-cream">
        <div className="lux-container">
          <HappyTravellers reviews={reviews} />
        </div>
      </section>

      {/* ───────────────────── Values ───────────────────── */}
      <section id="values" aria-labelledby="values-heading" className="lux-section scroll-mt-24 bg-mint/60">
        <div className="lux-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="lux-eyebrow justify-center">What we stand for</p>
            <h2 id="values-heading" className="mt-4 font-display text-h2 text-ink">
              {renderHeading("Four promises we [[keep]]", "forest")}
            </h2>
            {missionParagraphs.length > 0 ? (
              <div className="mt-4 space-y-3 text-lead text-ink-soft">
                {missionParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : null}
          </Reveal>

          <div className="mt-12">
            {values ? (
              <ValuesGrid values={values} />
            ) : (
              <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {DEFAULT_VALUES.map((value, index) => (
                  <StaggerItem key={value.title} className="h-full">
                    <div className="card-shine h-full rounded-3xl border border-line bg-paper p-6 shadow-hard-sm">
                      <span className="font-display text-4xl text-gold">{String(index + 1).padStart(2, "0")}</span>
                      <h3 className="mt-3 font-display text-xl text-ink">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.text}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </div>
        </div>
      </section>

      {/* ───────────────────── How we plan ───────────────────── */}
      <section aria-labelledby="plan-heading" className="lux-section scroll-mt-24 bg-cream">
        <div className="lux-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="lux-eyebrow justify-center">Plan with us</p>
            <h2 id="plan-heading" className="mt-4 font-display text-h2 text-ink">
              {renderHeading("How we plan your [[trip]]", "ocean")}
            </h2>
            <p className="mt-4 text-lead text-ink-soft">
              The same four steps whether you are booking a weekend break or a multi-stop holiday.
            </p>
          </Reveal>
          <div className="mt-10">
            <PlanSteps />
          </div>
        </div>
      </section>

      {/* ───────────────────── Contact (wrapped) ───────────────────── */}
      <section id="contact" aria-labelledby="contact-heading" className="relative scroll-mt-24 overflow-hidden bg-ink py-16 sm:py-20 lg:py-24">
        <div aria-hidden="true" className="about-stars absolute inset-0 opacity-50" />
        <div className="lux-container relative">
          <Reveal className="mx-auto max-w-2xl text-center text-white">
            <p className="lux-eyebrow justify-center text-[#e6cf9f]">Contact</p>
            <h2 id="contact-heading" className="mt-4 font-display text-h2 text-white">
              {renderHeading("Talk to [[us]]", "onDark")}
            </h2>
            <p className="mt-4 text-lead text-white/75">
              Send an enquiry below, or reach us directly — whichever suits you. A real person replies.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mx-auto mt-10 max-w-6xl rounded-[2rem] border border-white/15 bg-cream p-4 shadow-hard-xl sm:p-8">
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
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── Closing CTA ───────────────────── */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="lux-container">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-forest to-[#0f2e28] px-6 py-14 text-center text-white sm:px-12">
              <div aria-hidden="true" className="about-stars absolute inset-0 opacity-40" />
              <div className="relative">
                <h2 className="mx-auto max-w-[20ch] font-display text-h2 text-white">
                  {renderHeading("Let's plan your next [[trip]]", "onDark")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lead text-white/80">
                  Tell us where you would like to go, when, and who is travelling — we will take it from there.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <PlanTripButton className="!bg-gold !text-ink hover:!brightness-105" />
                  <Link
                    href="/destinations"
                    className="inline-flex h-14 items-center rounded-full border border-white/40 px-8 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    Browse destinations
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd data={breadcrumb} />
      <JsonLd data={localBusiness} />
    </>
  );
}
