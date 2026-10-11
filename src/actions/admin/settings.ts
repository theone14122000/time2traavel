"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { settingsSchema, type SettingsInput } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

export async function saveSettingsAction(
  values: SettingsInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const s = parsed.data;
  const data = {
    siteName: s.siteName,
    tagline: s.tagline || null,
    phone: s.phone || null,
    whatsapp: s.whatsapp || null,
    email: s.email || null,
    address: s.address,
    workingHours: s.workingHours || null,
    mapEmbedUrl: s.mapEmbedUrl || null,
    socials: s.socials,
    heroTitle: s.heroTitle || null,
    heroSubtitle: s.heroSubtitle || null,
    metaTitle: s.metaTitle || null,
    metaDescription: s.metaDescription || null,
    ogImage: s.ogImage || null,
    footerNote: s.footerNote || null,
  };

  try {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });
  } catch (error) {
    console.error("[admin:settings] save failed:", error);
    return failure("We couldn't save the site settings. Please try again.");
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  return ok("Site settings saved.");
}
