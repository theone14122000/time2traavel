import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { SITE_IDENTITY } from "@/lib/constants";
import { safeAdminQuery } from "@/actions/admin/shared";
import { toSocialLinks } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import type { SettingsInput } from "@/schemas/admin";
import { parseFontTheme } from "@/lib/font-theme";

export const metadata: Metadata = {
  title: "Site settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const row = await safeAdminQuery(
    "admin.settings",
    () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    null,
  );

  const initial: SettingsInput = {
    siteName: row?.siteName ?? SITE_IDENTITY.name,
    tagline: row?.tagline ?? "",
    fontTheme: parseFontTheme(row?.fontTheme),
    phone: row?.phone ?? "",
    whatsapp: row?.whatsapp ?? "",
    supportPhone: row?.supportPhone ?? "",
    email: row?.email ?? "",
    address: row?.address ?? SITE_IDENTITY.address,
    workingHours: row?.workingHours ?? "",
    mapEmbedUrl: row?.mapEmbedUrl ?? "",
    socials: toSocialLinks(row?.socials),
    heroTitle: row?.heroTitle ?? "",
    heroSubtitle: row?.heroSubtitle ?? "",
    metaTitle: row?.metaTitle ?? "",
    metaDescription: row?.metaDescription ?? "",
    ogImage: row?.ogImage ?? "",
    footerNote: row?.footerNote ?? "",
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Site settings"
        description={
          row
            ? "Business details shown in the header, footer, contact page and SEO tags."
            : "No settings row yet — saving creates it with factual defaults."
        }
      />
      <SettingsForm initial={initial} />
    </div>
  );
}
