import type { Metadata } from "next";
import { getDestinationOptions } from "@/actions/admin/packages";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PackageForm } from "@/components/admin/package-form";

export const metadata: Metadata = {
  title: "New package",
  robots: { index: false, follow: false },
};

export default async function AdminPackageNewPage() {
  const destinations = await getDestinationOptions();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Packages"
        title="New package"
        description="Add the basics first — itinerary, highlights and media can grow as you go."
      />
      <PackageForm destinations={destinations} />
    </div>
  );
}
