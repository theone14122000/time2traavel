import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { RevealTitle } from "@/components/shared/motion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getPageContent } from "@/lib/data/site";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent(CONTENT_KEYS.privacy);
  return buildMetadata({
    title: content?.title?.trim() || "Privacy Policy",
    description: `Privacy policy for ${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}.`,
    path: "/privacy",
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

export default async function PrivacyPage() {
  const content = await getPageContent(CONTENT_KEYS.privacy);
  const paragraphs = toParagraphs(content?.body);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
  ]);

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
        </Container>
      </div>

      <PageHeader
        tone="lavender"
        eyebrow="Legal"
        title={content?.title?.trim() || "Privacy Policy"}
        description={`How ${SITE_IDENTITY.name} handles information shared through this website.`}
      />

      <SectionWrapper tone="cream" bordered gridLines aria-labelledby="privacy-content-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="privacy-content-heading"
            eyebrow="The details"
            title={
              <RevealTitle as="span" className="block">
                What this policy covers
              </RevealTitle>
            }
            description="Everything below is published by our team from the admin panel."
          />

          {paragraphs.length > 0 ? (
            <div className="brutal-prose mt-8 max-w-3xl border-4 border-ink bg-paper p-6 shadow-brutal-md sm:p-8">
              {paragraphs.map((paragraph, index) => (
                <p key={`paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="mt-8 max-w-3xl">
              <EmptyState
                eyebrow="Not published yet"
                title="This page hasn't been published yet"
                description="Our privacy policy is being prepared. Need details sooner? Get in touch and we'll help."
                tone="paper"
                illustration="search"
                icon={<ShieldCheck className="size-8" aria-hidden="true" />}
                action={
                  <Button asChild variant="default" size="md">
                    <Link href="/about-us#contact">Contact us</Link>
                  </Button>
                }
              />
            </div>
          )}
        </Reveal>
      </SectionWrapper>

      <JsonLd data={breadcrumb} />
    </>
  );
}
