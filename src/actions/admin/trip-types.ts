"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { tripTypeSchema, type TripTypeInput } from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateTripTypes(slug?: string) {
  revalidatePath("/admin/trip-types");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/trip-types");
  revalidatePath("/packages");
  if (slug) revalidatePath(`/trip-types/${slug}`);
}

export async function saveTripTypeAction(
  id: string | null,
  values: TripTypeInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = tripTypeSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const t = parsed.data;
  const data = {
    name: t.name,
    slug: t.slug,
    icon: t.icon || null,
    color: t.color || null,
    description: t.description || null,
    coverImage: t.coverImage || null,
    coverImageAlt: t.coverImageAlt || null,
    published: t.published,
    order: Number(t.order),
  };

  try {
    if (id) {
      const existing = await prisma.tripType.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return failure("That trip type no longer exists.");
      }
      await prisma.tripType.update({ where: { id }, data });
      revalidateTripTypes(t.slug);
      if (existing.slug !== t.slug) revalidateTripTypes(existing.slug);
      return ok(`Updated “${t.name}”.`);
    }

    await prisma.tripType.create({ data });
    revalidateTripTypes(t.slug);
    return ok(`Created “${t.name}”.`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("That slug is already used by another trip type.", {
        slug: ["This slug is already taken"],
      });
    }
    console.error("[admin:trip-types] save failed:", error);
    return failure("We couldn't save the trip type. Please try again.");
  }
}

export async function deleteTripTypeAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.tripType.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true },
    });
    if (!existing) {
      return failure("That trip type no longer exists.");
    }
    await prisma.tripType.delete({ where: { id } });
    revalidateTripTypes(existing.slug);
    return ok(`Deleted “${existing.name}”.`);
  } catch (error) {
    console.error("[admin:trip-types] delete failed:", error);
    return failure("We couldn't delete that trip type. Please try again.");
  }
}

/** Read one trip type for the edit form. */
export async function getTripTypeForEdit(id: string) {
  await requireAdmin();
  return safeAdminQuery(
    `trip-types.edit:${id}`,
    () => prisma.tripType.findUnique({ where: { id } }),
    null,
  );
}
