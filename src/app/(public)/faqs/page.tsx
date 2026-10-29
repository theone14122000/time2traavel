import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqView } from "@/components/home/faq-view";
import { getPublishedFaqs } from "@/lib/data/reviews";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "FAQs",
    description:
      "Answers to common questions about planning, booking and travelling with Time to Travel. Search or browse by category.",
    path: "/faqs",
  });
}

export default async function FaqsPage() {
  const faqs = await getPublishedFaqs();

  return (
    <>
      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="FAQs"
        title="Questions, answered"
        description="Search the questions travellers ask us most. Every answer below is published by our team."
        tone="lavender"
      />

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="faqs-view-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="faqs-view-heading" className="sr-only">
          Frequently asked questions
        </h2>
        <FaqView faqs={faqs} />
      </SectionWrapper>
    </>
  );
}
