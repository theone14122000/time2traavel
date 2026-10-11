import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDestinationOptions,
  getPackageForEdit,
} from "@/actions/admin/packages";
import { arrayToLines } from "@/actions/admin/shared";
import { toGallery } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PackageForm } from "@/components/admin/package-form";
import type { PackageInput } from "@/schemas/admin";

export const metadata: Metadata = {
  title: "Edit package",
  robots: { index: false, follow: false },
};

export default async function AdminPackageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pkg, destinations] = await Promise.all([
    getPackageForEdit(id),
    getDestinationOptions(),
  ]);
  if (!pkg) notFound();

  const initial: PackageInput = {
    title: pkg.title,
    slug: pkg.slug,
    summary: pkg.summary ?? "",
    description: pkg.description ?? "",
    destinationId: pkg.destinationId ?? "",
    durationDays: String(pkg.durationDays),
    durationLabel: pkg.durationLabel ?? "",
    price: pkg.price === null ? "" : String(pkg.price),
    currency: pkg.currency,
    priceNote: pkg.priceNote ?? "",
    highlights: arrayToLines(pkg.highlights),
    inclusions: arrayToLines(pkg.inclusions),
    exclusions: arrayToLines(pkg.exclusions),
    image: pkg.image ?? "",
    imageAlt: pkg.imageAlt ?? "",
    gallery: toGallery(pkg.gallery),
    itinerary: pkg.itinerary.map((day) => ({
      title: day.title,
      description: day.description,
    })),
    featured: pkg.featured,
    published: pkg.published,
    order: String(pkg.order),
    seoTitle: pkg.seoTitle ?? "",
    seoDescription: pkg.seoDescription ?? "",
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Packages"
        title={`Edit — ${pkg.title}`}
        description="Itinerary day numbers are re-sequenced automatically on save."
      />
      <PackageForm packageId={pkg.id} initial={initial} destinations={destinations} />
    </div>
  );
}
