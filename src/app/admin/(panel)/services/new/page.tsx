import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = {
  title: "New service",
  robots: { index: false, follow: false },
};

export default function AdminServiceNewPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Services"
        title="New service"
        description="Drafts stay hidden until published. Process steps and FAQs are plain JSON arrays."
      />
      <ServiceForm />
    </div>
  );
}
