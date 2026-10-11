import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/actions/admin/shared";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FaqList, type FaqRow } from "@/components/admin/faq-list";

export const metadata: Metadata = {
  title: "FAQs",
  robots: { index: false, follow: false },
};

export default async function AdminFaqsPage() {
  const faqs = await safeAdminQuery(
    "admin.faqs.list",
    () =>
      prisma.faq.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    [],
  );

  const rows: FaqRow[] = faqs.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    order: row.order,
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="FAQs"
        description="Published questions render in the accordion on the home page."
      />
      <FaqList faqs={rows} />
    </div>
  );
}
