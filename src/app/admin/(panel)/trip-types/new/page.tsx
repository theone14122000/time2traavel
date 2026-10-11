import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TripTypeForm } from "@/components/admin/trip-type-form";

export const metadata: Metadata = {
  title: "New trip type",
  robots: { index: false, follow: false },
};

export default function AdminTripTypeNewPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Trip types"
        title="New trip type"
        description="Drafts stay hidden until published."
      />
      <TripTypeForm />
    </div>
  );
}
