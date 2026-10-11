import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GuidePostForm } from "@/components/admin/guide-post-form";

export const metadata: Metadata = {
  title: "New guide",
  robots: { index: false, follow: false },
};

export default function AdminGuideNewPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Guides"
        title="New guide"
        description="Drafts stay hidden until published. The body is plain text."
      />
      <GuidePostForm />
    </div>
  );
}
