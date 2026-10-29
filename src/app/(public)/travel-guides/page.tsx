import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, Compass, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { TagChip } from "@/components/ui/badge";
import { getGuideCategories, getPublishedGuides, type GuideCard } from "@/lib/data/guides";
import { formatDate } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Travel Guides",
    description:
      "Practical travel guides from Time to Travel — packing, planning, destinations and trip tips. Filter by category.",
    path: "/travel-guides",
  });
}

function GuideCardTile({ guide }: { guide: GuideCard }) {
  return (
    <article className="flex h-full flex-col border border-line bg-paper shadow-brutal-md transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg">
      <Link href={`/travel-guides/${guide.slug}`} className="group block">
        <div className="relative aspect-video w-full overflow-hidden border-b border-line bg-butter">
          {guide.coverImage ? (
            <Image
              src={guide.coverImage}
              alt={guide.coverImageAlt || guide.title}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid-lines absolute inset-0 flex items-center justify-center bg-butter">
              <span className="label-brutal border border-line bg-paper px-3 py-1.5">
                {guide.category}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-brutal border border-line bg-lemon px-2 py-1">
            {guide.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft">
            <Clock aria-hidden="true" className="size-3.5" />
            {guide.readingMinutes ?? 1} min read
          </span>
        </div>

        <h2 className="font-display text-h4 uppercase leading-tight">
          <Link href={`/travel-guides/${guide.slug}`} className="hover:underline">
            {guide.title}
          </Link>
        </h2>

        {guide.excerpt ? (
          <p className="text-sm font-medium leading-relaxed text-ink-soft">{guide.excerpt}</p>
        ) : null}

        <p className="mt-auto pt-2 text-xs font-semibold text-ink-soft">
          {formatDate(guide.createdAt)}
        </p>

        <div>
          <Link
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            href={`/travel-guides/${guide.slug}`}
          >
            Read guide
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function TravelGuidesPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawCategory = params.category?.trim() || "";
  const categories = await getGuideCategories();
  const activeCategory = categories.includes(rawCategory) ? rawCategory : "";
  const guides = await getPublishedGuides(
    activeCategory ? { category: activeCategory } : undefined,
  );

  return (
    <>
      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Travel Guides" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Travel Guides"
        title="Read before you go"
        description="Practical guides written by our team — packing lists, planning tips and destination notes. Filter by category below."
        tone="sky"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/packages">
          <Compass aria-hidden="true" className="size-4" />
          Browse packages
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="guides-grid-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="flex flex-col gap-4">
          <h2 id="guides-grid-heading" className="sr-only">
            Published guides
          </h2>

          {categories.length > 0 ? (
            <nav aria-label="Guide categories" className="flex flex-wrap gap-2">
              <Link href="/travel-guides">
                <TagChip active={!activeCategory}>All</TagChip>
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/travel-guides?category=${encodeURIComponent(category)}`}
                >
                  <TagChip active={activeCategory === category}>{category}</TagChip>
                </Link>
              ))}
            </nav>
          ) : null}

          <p role="status" aria-live="polite" className="label-brutal text-ink-soft">
            <Tag aria-hidden="true" className="mr-1 inline size-3" />
            {guides.length} {guides.length === 1 ? "guide" : "guides"}
            {activeCategory ? ` in ${activeCategory}` : ""}
          </p>
        </div>

        <div className="mt-8">
          {guides.length === 0 ? (
            <EmptyState
              eyebrow="Guides"
              title={activeCategory ? `No guides in ${activeCategory} yet` : "Guides coming soon"}
              description={
                activeCategory
                  ? "Try another category, or browse everything."
                  : "Our travel guides are being written. In the meantime, browse packages or plan a trip with us."
              }
              tone="sky"
              illustration="search"
              action={
                <>
                  {activeCategory ? (
                    <Link
                      className={buttonVariants({ variant: "secondary", size: "md" })}
                      href="/travel-guides"
                    >
                      All guides
                    </Link>
                  ) : null}
                  <Link
                    className={buttonVariants({ variant: "default", size: "md" })}
                    href="/plan-my-trip"
                  >
                    Plan my trip
                  </Link>
                </>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <GuideCardTile key={guide.id} guide={guide} />
              ))}
            </div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
