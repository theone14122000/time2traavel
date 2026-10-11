import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTripTypeForEdit } from "@/actions/admin/trip-types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TripTypeForm } from "@/components/admin/trip-type-form";
import type { TripTypeInput } from "@/schemas/admin";

export const metadata: Metadata = {
  title: "Edit trip type",
  robots: { index: false, follow: false },
};

export default async function AdminTripTypeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripType = await getTripTypeForEdit(id);
  if (!tripType) notFound();

  const initial: TripTypeInput = {
    name: tripType.name,
    slug: tripType.slug,
    icon: tripType.icon ?? "",
    color: tripType.color ?? "",
    description: tripType.description ?? "",
    coverImage: tripType.coverImage ?? "",
    coverImageAlt: tripType.coverImageAlt ?? "",
    published: tripType.published,
    order: String(tripType.order),
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Trip types"
        title={`Edit — ${tripType.name}`}
        description="Changes go live as soon as you save (when published)."
      />
      <TripTypeForm tripTypeId={tripType.id} initial={initial} />
    </div>
  );
}
