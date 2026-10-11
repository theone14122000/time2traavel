"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { serviceSchema, type ServiceInput } from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateServices(slug?: string) {
  revalidatePath("/admin/services");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/services");
  if (slug) revalidatePath(`/services/${slug}`);
}

/** Parse a zod-validated JSON textarea into a Prisma Json value (or null). */
function toJsonArray(
  value: string | null | undefined,
): Prisma.InputJsonValue | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? (parsed as Prisma.InputJsonValue) : null;
  } catch {
    return null;
  }
}

export async function saveServiceAction(
  id: string | null,
  values: ServiceInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const s = parsed.data;
  const data = {
    title: s.title,
    slug: s.slug,
    icon: s.icon || null,
    color: s.color || null,
    shortDescription: s.shortDescription || null,
    longDescription: s.longDescription || null,
    coverImage: s.coverImage || null,
    coverImageAlt: s.coverImageAlt || null,
    processSteps: toJsonArray(s.processSteps) ?? Prisma.DbNull,
    faqs: toJsonArray(s.faqs) ?? Prisma.DbNull,
    linkedPackageSlugs: toJsonArray(s.linkedPackageSlugs) ?? Prisma.DbNull,
    seoTitle: s.seoTitle || null,
    seoDescription: s.seoDescription || null,
    published: s.published,
    order: Number(s.order),
  };

  try {
    if (id) {
      const existing = await prisma.service.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return failure("That service no longer exists.");
      }
      await prisma.service.update({ where: { id }, data });
      revalidateServices(s.slug);
      if (existing.slug !== s.slug) revalidateServices(existing.slug);
      return ok(`Updated “${s.title}”.`);
    }

    await prisma.service.create({ data });
    revalidateServices(s.slug);
    return ok(`Created “${s.title}”.`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("That slug is already used by another service.", {
        slug: ["This slug is already taken"],
      });
    }
    console.error("[admin:services] save failed:", error);
    return failure("We couldn't save the service. Please try again.");
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.service.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });
    if (!existing) {
      return failure("That service no longer exists.");
    }
    await prisma.service.delete({ where: { id } });
    revalidateServices(existing.slug);
    return ok(`Deleted “${existing.title}”.`);
  } catch (error) {
    console.error("[admin:services] delete failed:", error);
    return failure("We couldn't delete that service. Please try again.");
  }
}

/** Read one service for the edit form. */
export async function getServiceForEdit(id: string) {
  await requireAdmin();
  return safeAdminQuery(
    `services.edit:${id}`,
    () => prisma.service.findUnique({ where: { id } }),
    null,
  );
}
