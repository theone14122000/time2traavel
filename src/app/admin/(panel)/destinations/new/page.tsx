import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DestinationForm } from "@/components/admin/destination-form";

export const metadata: Metadata = {
  title: "New destination",
  robots: { index: false, follow: false },
};

export default function AdminDestinationNewPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Destinations"
        title="New destination"
        description="Only the name, slug and state are required — everything else can be filled later."
      />
      <DestinationForm />
    </div>
  );
}
