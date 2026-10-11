"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import {
  destinationSchema,
  type DestinationInput,
} from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateDestinations(slug?: string) {
  revalidatePath("/admin/destinations");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/destinations");
  if (slug) revalidatePath(`/destinations/${slug}`);
}

export async function saveDestinationAction(
  id: string | null,
  values: DestinationInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = destinationSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    slug: d.slug,
    state: d.state,
    region: d.region || null,
    summary: d.summary || null,
    description: d.description || null,
    bestTimeToVisit: d.bestTimeToVisit || null,
    image: d.image || null,
    imageAlt: d.imageAlt || null,
    gallery: d.gallery,
    featured: d.featured,
    published: d.published,
    order: Number(d.order),
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };

  try {
    if (id) {
      const existing = await prisma.destination.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return failure("That destination no longer exists.");
      }
      await prisma.destination.update({ where: { id }, data });
      revalidateDestinations(d.slug);
      if (existing.slug !== d.slug) revalidateDestinations(existing.slug);
      return ok(`Updated “${d.name}”.`);
    }

    await prisma.destination.create({ data });
    revalidateDestinations(d.slug);
    return ok(`Created “${d.name}”.`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("That slug is already used by another destination.", {
        slug: ["This slug is already taken"],
      });
    }
    console.error("[admin:destinations] save failed:", error);
    return failure("We couldn't save the destination. Please try again.");
  }
}

export async function deleteDestinationAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.destination.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true },
    });
    if (!existing) {
      return failure("That destination no longer exists.");
    }
    await prisma.destination.delete({ where: { id } });
    revalidateDestinations(existing.slug);
    return ok(`Deleted “${existing.name}”.`);
  } catch (error) {
    console.error("[admin:destinations] delete failed:", error);
    return failure("We couldn't delete that destination. Please try again.");
  }
}

/** Read one destination for the edit form. */
export async function getDestinationForEdit(id: string) {
  await requireAdmin();
  return safeAdminQuery(
    `destinations.edit:${id}`,
    () => prisma.destination.findUnique({ where: { id } }),
    null,
  );
}
