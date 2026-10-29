import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Compass } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TagChip } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getGalleryCategories, getGalleryItems } from "@/lib/data/gallery";
import { pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Gallery",
    description:
      "Photos from Time to Travel trips — filter by category and open any shot full-screen.",
    path: "/gallery",
  });
}

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawCategory = params.category?.trim() || "";
  const categories = await getGalleryCategories();
  const activeCategory = categories.includes(rawCategory) ? rawCategory : "";
  const items = await getGalleryItems(
    activeCategory ? { category: activeCategory } : undefined,
  );

  return (
    <>
      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Gallery"
        title="Scenes from the road"
        description="Photos uploaded by our team. Filter by category and click any photo to open it full-screen."
        tone="peach"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/destinations">
          <Compass aria-hidden="true" className="size-4" />
          Destinations
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="gallery-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="flex flex-col gap-4">
          <h2 id="gallery-heading" className="sr-only">
            Photo gallery
          </h2>

          {categories.length > 0 ? (
            <nav aria-label="Gallery categories" className="flex flex-wrap gap-2">
              <Link href="/gallery">
                <TagChip active={!activeCategory}>All</TagChip>
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/gallery?category=${encodeURIComponent(category)}`}
                >
                  <TagChip active={activeCategory === category}>{category}</TagChip>
                </Link>
              ))}
            </nav>
          ) : null}

          <p role="status" aria-live="polite" className="label-brutal text-ink-soft">
            <Camera aria-hidden="true" className="mr-1 inline size-3" />
            {pluralize(items.length, "photo")}
            {activeCategory ? ` in ${activeCategory}` : ""}
          </p>
        </div>

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              eyebrow="Gallery"
              title={activeCategory ? `No photos in ${activeCategory} yet` : "Gallery coming soon"}
              description={
                activeCategory
                  ? "Try another category, or browse everything."
                  : "Photos are being framed. Browse destinations or plan a trip in the meantime."
              }
              tone="peach"
              illustration="map"
              action={
                <>
                  {activeCategory ? (
                    <Link
                      className={buttonVariants({ variant: "secondary", size: "md" })}
                      href="/gallery"
                    >
                      All photos
                    </Link>
                  ) : null}
                  <Link
                    className={buttonVariants({ variant: "default", size: "md" })}
                    href="/destinations"
                  >
                    Browse destinations
                  </Link>
                </>
              }
            />
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
