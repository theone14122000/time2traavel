import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldQuestion } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { getPageContent } from "@/lib/data/site";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

/**
 * Page-content key for the cancellation & refund policy. Cast keeps this
 * page compiling even if the shared CONTENT_KEYS map hasn't gained the key
 * yet (the constant file is owned elsewhere).
 */
const CANCELLATION_REFUND_KEY =
  "legal.cancellationRefund" as (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS];

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent(CANCELLATION_REFUND_KEY);
  return buildMetadata({
    title: content?.title?.trim() || "Cancellation & Refund",
    description: `Cancellation and refund policy for ${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}.`,
    path: "/cancellation-refund",
  });
}

function toParagraphs(body: string | null | undefined): string[] {
  if (!body) return [];
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function CancellationRefundPage() {
  const content = await getPageContent(CANCELLATION_REFUND_KEY);
  const paragraphs = toParagraphs(content?.body);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cancellation & Refund", path: "/cancellation-refund" },
  ]);

  return (
    <>
      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Cancellation & Refund" }]}
          />
        </Container>
      </div>

      <PageHeader
        tone="lavender"
        eyebrow="Legal"
        title={content?.title?.trim() || "Cancellation & Refund"}
        description={`How ${SITE_IDENTITY.name} handles cancellations, changes and refunds.`}
      />

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="cancellation-content-heading"
      >
        <div className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="cancellation-content-heading"
            eyebrow="The details"
            title="What this page covers"
            description="Everything below is published by our team from the admin panel."
          />

          {paragraphs.length > 0 ? (
            <div className="brutal-prose mt-8 max-w-3xl border border-line bg-paper p-6 shadow-brutal-md sm:p-8">
              {paragraphs.map((paragraph, index) => (
                <p key={`paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="mt-8 max-w-3xl">
              <EmptyState
                eyebrow="Not published yet"
                title="This page hasn't been published yet"
                description="Our cancellation and refund policy is being prepared. Need the details for a booking? Get in touch and we'll help."
                tone="paper"
                illustration="search"
                icon={<Scale className="size-8" aria-hidden="true" />}
                action={
                  <>
                    <ButtonLink href="/about-us#contact">Contact us</ButtonLink>
                    <ButtonLink href="/faqs" variant="outline">
                      FAQs
                    </ButtonLink>
                  </>
                }
              />
            </div>
          )}

          <div className="mt-10 border border-line bg-butter p-5 shadow-brutal-md sm:p-6">
            <h2 className="font-display text-h4 uppercase">Questions about a booking?</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-ink-soft">
              If you already have an enquiry with us, reference it when you write so we can
              find it quickly.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href="/track-inquiry">Track an enquiry</ButtonLink>
              <ButtonLink href="/about-us#contact" variant="outline">
                <ShieldQuestion aria-hidden="true" className="size-4" />
                Contact us
              </ButtonLink>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <JsonLd data={breadcrumb} />
    </>
  );
}

function ButtonLink({
  href,
  variant = "default",
  children,
}: {
  href: string;
  variant?: "default" | "outline";
  children: React.ReactNode;
}) {
  return (
    <Link className={buttonVariants({ variant, size: "md" })} href={href}>
      {children}
    </Link>
  );
}
