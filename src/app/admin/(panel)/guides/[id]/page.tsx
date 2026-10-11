import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuidePostForEdit } from "@/actions/admin/guides";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GuidePostForm } from "@/components/admin/guide-post-form";
import type { GuidePostInput } from "@/schemas/admin";

export const metadata: Metadata = {
  title: "Edit guide",
  robots: { index: false, follow: false },
};

export default async function AdminGuideEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await getGuidePostForEdit(id);
  if (!guide) notFound();

  const initial: GuidePostInput = {
    title: guide.title,
    slug: guide.slug,
    excerpt: guide.excerpt ?? "",
    body: guide.body ?? "",
    category: guide.category,
    coverImage: guide.coverImage ?? "",
    coverImageAlt: guide.coverImageAlt ?? "",
    readingMinutes: guide.readingMinutes === null ? "" : String(guide.readingMinutes),
    seoTitle: guide.seoTitle ?? "",
    seoDescription: guide.seoDescription ?? "",
    published: guide.published,
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Guides"
        title={`Edit — ${guide.title}`}
        description="Changes go live as soon as you save (when published)."
      />
      <GuidePostForm guideId={guide.id} initial={initial} />
    </div>
  );
}
