import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  estimateReadingMinutes,
  getGuideBySlug,
  getRelatedGuides,
  type GuideCard,
} from "@/lib/data/guides";
import { formatDate } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return buildMetadata({
      title: "Guide not found",
      description: "This travel guide could not be found.",
      path: `/travel-guides/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: guide.seoTitle ?? guide.title,
    description: guide.seoDescription ?? guide.excerpt ?? `Travel guide: ${guide.title}.`,
    path: `/travel-guides/${guide.slug}`,
    image: guide.coverImage,
    type: "article",
  });
}

function RelatedGuideTile({ guide }: { guide: GuideCard }) {
  return (
    <article className="flex h-full flex-col border border-line bg-paper p-4 shadow-hard-sm">
      <span className="label-brutal w-fit border border-line bg-lemon px-2 py-1">
        {guide.category}
      </span>
      <h3 className="mt-3 font-display text-base uppercase leading-snug">
        <Link href={`/travel-guides/${guide.slug}`} className="hover:underline">
          {guide.title}
        </Link>
      </h3>
      {guide.excerpt ? (
        <p className="mt-2 line-clamp-3 text-sm font-medium text-ink-soft">{guide.excerpt}</p>
      ) : null}
      <p className="mt-auto pt-3 text-xs font-semibold text-ink-soft">
        {formatDate(guide.createdAt)}
      </p>
    </article>
  );
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const related = await getRelatedGuides(guide.category, guide.slug, 3);
  const readingMinutes = guide.readingMinutes ?? estimateReadingMinutes(guide.body);

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Travel Guides", path: "/travel-guides" },
    { name: guide.title, path: `/travel-guides/${guide.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Travel Guides", href: "/travel-guides" },
              { label: guide.title },
            ]}
          />
        </Container>
      </div>

      <PageHeader
        eyebrow={guide.category}
        title={guide.title}
        description={guide.excerpt}
        tone="sky"
      >
        <span className="inline-flex items-center gap-1.5 border border-line bg-paper px-3 py-2 text-sm font-bold uppercase">
          <Clock aria-hidden="true" className="size-4" />
          {readingMinutes} min read
        </span>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/travel-guides">
          <ArrowLeft aria-hidden="true" className="size-4" />
          All guides
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="guide-body-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="guide-body-heading" className="sr-only">
          Guide
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <span className="label-brutal inline-flex items-center gap-1 border border-line bg-lemon px-2 py-1">
            <Tag aria-hidden="true" className="size-3" />
            {guide.category}
          </span>
          <span className="text-xs font-semibold text-ink-soft">
            Updated {formatDate(guide.updatedAt)}
          </span>
        </div>

        {guide.coverImage ? (
          <div className="relative mt-6 aspect-video w-full overflow-hidden border border-line shadow-brutal-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guide.coverImage}
              alt={guide.coverImageAlt || guide.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        {guide.body ? (
          <div className="brutal-prose mt-8 max-w-3xl whitespace-pre-line border border-line bg-paper p-6 shadow-brutal-md sm:p-8">
            {guide.body}
          </div>
        ) : (
          <div className="mt-8 max-w-3xl">
            <EmptyState
              eyebrow="Guide"
              title="This guide has no body yet"
              description="The write-up is being prepared. Browse the other guides or plan a trip with us in the meantime."
              tone="paper"
              illustration="search"
              action={
                <Link
                  className={buttonVariants({ variant: "default", size: "md" })}
                  href="/travel-guides"
                >
                  All guides
                </Link>
              }
            />
          </div>
        )}
      </SectionWrapper>

      {related.length > 0 ? (
        <SectionWrapper
          tone="butter"
          bordered
          aria-labelledby="related-guides-heading"
          containerClassName="py-12 sm:py-16 lg:py-20"
        >
          <SectionHeading
            id="related-guides-heading"
            eyebrow="Keep reading"
            title="Related guides"
            description={`More from ${guide.category}.`}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <RelatedGuideTile key={item.id} guide={item} />
            ))}
          </div>
        </SectionWrapper>
      ) : null}
    </>
  );
}
