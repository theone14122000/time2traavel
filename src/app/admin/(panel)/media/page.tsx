import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/actions/admin/shared";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaManager, type MediaRow } from "@/components/admin/media-manager";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const assets = await safeAdminQuery(
    "admin.media.list",
    () =>
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: 300,
      }),
    [],
  );

  const rows: MediaRow[] = assets.map((asset) => ({
    id: asset.id,
    url: asset.url,
    alt: asset.alt,
    provider: asset.provider,
    createdAt: asset.createdAt.toISOString(),
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Library"
        title="Media"
        description="Upload once, copy the URL into destination/package image fields. Files are stored in /public/uploads."
      />
      <MediaManager assets={rows} />
    </div>
  );
}
