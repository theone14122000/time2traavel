import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/actions/admin/shared";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomeSectionsManager } from "./home-sections-manager";

export const metadata: Metadata = {
  title: "Home sections",
  robots: { index: false, follow: false },
};

export default async function AdminHomeSectionsPage() {
  const sections = await safeAdminQuery(
    "admin.homeSections.list",
    () =>
      prisma.homeSection.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          key: true,
          enabled: true,
          order: true,
          config: true,
        },
      }),
    [],
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Home sections"
        description="Sections hide automatically when their content is empty."
      />
      <HomeSectionsManager
        sections={sections.map((section) => ({
          ...section,
          config:
            section.config === null
              ? ""
              : typeof section.config === "string"
                ? section.config
                : JSON.stringify(section.config, null, 2),
        }))}
      />
    </div>
  );
}
