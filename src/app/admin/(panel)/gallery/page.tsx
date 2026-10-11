import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDestinationOptions } from "@/actions/admin/packages";
import { safeAdminQuery } from "@/actions/admin/shared";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GalleryForm } from "@/components/admin/gallery-form";

export const metadata: Metadata = {
  title: "Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  const [items, destinations] = await Promise.all([
    safeAdminQuery(
      "admin.gallery.list",
      () =>
        prisma.galleryItem.findMany({
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            url: true,
            alt: true,
            category: true,
            caption: true,
            destinationId: true,
            order: true,
            createdAt: true,
          },
        }),
      [],
    ),
    getDestinationOptions(),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Gallery"
        description="Site-wide image gallery. Alt text is required on every item."
      />
      <GalleryForm
        items={items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        destinations={destinations}
      />
    </div>
  );
}
