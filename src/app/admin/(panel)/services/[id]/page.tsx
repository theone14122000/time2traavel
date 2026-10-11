import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceForEdit } from "@/actions/admin/services";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServiceForm } from "@/components/admin/service-form";
import type { ServiceInput } from "@/schemas/admin";

export const metadata: Metadata = {
  title: "Edit service",
  robots: { index: false, follow: false },
};

function toJsonText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceForEdit(id);
  if (!service) notFound();

  const initial: ServiceInput = {
    title: service.title,
    slug: service.slug,
    icon: service.icon ?? "",
    color: service.color ?? "",
    shortDescription: service.shortDescription ?? "",
    longDescription: service.longDescription ?? "",
    coverImage: service.coverImage ?? "",
    coverImageAlt: service.coverImageAlt ?? "",
    processSteps: toJsonText(service.processSteps),
    faqs: toJsonText(service.faqs),
    linkedPackageSlugs: toJsonText(service.linkedPackageSlugs),
    seoTitle: service.seoTitle ?? "",
    seoDescription: service.seoDescription ?? "",
    published: service.published,
    order: String(service.order),
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Services"
        title={`Edit — ${service.title}`}
        description="Changes go live as soon as you save (when published)."
      />
      <ServiceForm serviceId={service.id} initial={initial} />
    </div>
  );
}
