import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDestinationForEdit } from "@/actions/admin/destinations";
import { toGallery } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DestinationForm } from "@/components/admin/destination-form";
import type { DestinationInput } from "@/schemas/admin";

export const metadata: Metadata = {
  title: "Edit destination",
  robots: { index: false, follow: false },
};

export default async function AdminDestinationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const destination = await getDestinationForEdit(id);
  if (!destination) notFound();

  const initial: DestinationInput = {
    name: destination.name,
    slug: destination.slug,
    state: destination.state,
    region: destination.region ?? "",
    summary: destination.summary ?? "",
    description: destination.description ?? "",
    bestTimeToVisit: destination.bestTimeToVisit ?? "",
    image: destination.image ?? "",
    imageAlt: destination.imageAlt ?? "",
    gallery: toGallery(destination.gallery),
    featured: destination.featured,
    published: destination.published,
    order: String(destination.order),
    seoTitle: destination.seoTitle ?? "",
    seoDescription: destination.seoDescription ?? "",
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Destinations"
        title={`Edit — ${destination.name}`}
        description="Changes go live as soon as you save (when published)."
      />
      <DestinationForm destinationId={destination.id} initial={initial} />
    </div>
  );
}
