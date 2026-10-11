import "server-only";
import { prisma } from "@/lib/prisma";
import { CONTENT_KEYS, SITE_IDENTITY } from "@/lib/constants";
import { safeQuery } from "@/lib/data/safe";
import { toSocialLinks, type SocialLink } from "@/lib/utils";

export type SiteSettingsShape = {
  siteName: string;
  tagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string;
  workingHours: string | null;
  mapEmbedUrl: string | null;
  socials: SocialLink[];
  heroTitle: string | null;
  heroSubtitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  footerNote: string | null;
};

/**
 * Public map embed for Kasumpti, Shimla (Google Maps, no API key required).
 * Admin can override it from Site Settings.
 */
export const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Kasumpti%2C%20Shimla%2C%20Himachal%20Pradesh%2C%20India&z=13&output=embed";

/** Site settings with verified business details as fallbacks. */
export async function getSiteSettings(): Promise<SiteSettingsShape> {
  const row = await safeQuery(
    "siteSettings",
    () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    null,
  );

  return {
    siteName: row?.siteName?.trim() || SITE_IDENTITY.name,
    tagline: row?.tagline?.trim() || null,
    phone: row?.phone?.trim() || null,
    whatsapp: row?.whatsapp?.trim() || null,
    email: row?.email?.trim() || null,
    address: row?.address?.trim() || SITE_IDENTITY.address,
    workingHours: row?.workingHours?.trim() || null,
    mapEmbedUrl: row?.mapEmbedUrl?.trim() || DEFAULT_MAP_EMBED_URL,
    socials: toSocialLinks(row?.socials),
    heroTitle: row?.heroTitle?.trim() || null,
    heroSubtitle: row?.heroSubtitle?.trim() || null,
    metaTitle: row?.metaTitle?.trim() || null,
    metaDescription: row?.metaDescription?.trim() || null,
    ogImage: row?.ogImage?.trim() || null,
    footerNote: row?.footerNote?.trim() || null,
  };
}

export type PageContentShape = {
  key: string;
  title: string | null;
  body: string | null;
  data: unknown;
};

/** Returns null when the admin has not published content for this key. */
export async function getPageContent(
  key: (typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS],
): Promise<PageContentShape | null> {
  const row = await safeQuery(
    `pageContent:${key}`,
    () => prisma.pageContent.findUnique({ where: { key } }),
    null,
  );
  if (!row) return null;
  return {
    key: row.key,
    title: row.title,
    body: row.body,
    data: row.data ?? null,
  };
}

/** Convenience: why-choose-us items managed from admin (array in `data`). */
export type WhyChooseItem = { title: string; description: string };

export async function getWhyChooseItems(): Promise<WhyChooseItem[]> {
  const content = await getPageContent(CONTENT_KEYS.homeWhyChooseUs);
  const data = content?.data;
  if (Array.isArray(data)) {
    return data
      .filter(
        (item): item is WhyChooseItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as WhyChooseItem).title === "string" &&
          typeof (item as WhyChooseItem).description === "string",
      )
      .map((item) => ({
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.title.length > 0);
  }
  return [];
}

/** Contact helpers that hide gracefully when nothing is configured. */
export async function getContactDetails() {
  const settings = await getSiteSettings();
  return {
    settings,
    hasPhone: Boolean(settings.phone),
    hasEmail: Boolean(settings.email),
    hasWhatsApp: Boolean(settings.whatsapp),
    whatsappUrl: settings.whatsapp
      ? `https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
          "Hello Time to Travel, I would like to plan a trip.",
        )}`
      : null,
    phoneHref: settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : null,
    emailHref: settings.email ? `mailto:${settings.email}` : null,
    mapEmbedUrl: settings.mapEmbedUrl ?? DEFAULT_MAP_EMBED_URL,
  };
}
