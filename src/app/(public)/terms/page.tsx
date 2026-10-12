import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
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
  const content = await getPageContent(CONTENT_KEYS.terms);
  return buildMetadata({
    title: content?.title?.trim() || "Terms of Service",
    description: `Terms of service for ${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}.`,
    path: "/terms",
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

export default async function TermsPage() {
  const content = await getPageContent(CONTENT_KEYS.terms);
  const paragraphs = toParagraphs(content?.body);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Terms of Service", path: "/terms" },
  ]);

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms" }]} />
        </Container>
      </div>

      <PageHeader
        tone="sky"
        eyebrow="Legal"
        title={content?.title?.trim() || "Terms of Service"}
        description={`Terms of service for ${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}.`}
      />

      <SectionWrapper tone="cream" bordered gridLines aria-labelledby="terms-content-heading">
        <Reveal className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="terms-content-heading"
            eyebrow="The details"
            title={
              <RevealTitle as="span" className="block">
                What these terms cover
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
                description="Our terms of service are being prepared. Need details sooner? Get in touch and we'll help."
                tone="paper"
                illustration="luggage"
                icon={<FileText className="size-8" aria-hidden="true" />}
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
