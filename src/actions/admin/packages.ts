"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { packageSchema, type PackageInput } from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  linesToArray,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidatePackages(slug?: string) {
  revalidatePath("/admin/packages");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/packages");
  if (slug) revalidatePath(`/packages/${slug}`);
}

export async function savePackageAction(
  id: string | null,
  values: PackageInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = packageSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const p = parsed.data;
  const destinationId = p.destinationId ? p.destinationId : null;
  const price = p.price?.trim() ? Number(p.price) : null;

  const data = {
    title: p.title,
    slug: p.slug,
    summary: p.summary || null,
    description: p.description || null,
    destinationId,
    durationDays: Number(p.durationDays),
    durationLabel: p.durationLabel || null,
    price,
    currency: p.currency || "INR",
    priceNote: p.priceNote || null,
    highlights: linesToArray(p.highlights),
    inclusions: linesToArray(p.inclusions),
    exclusions: linesToArray(p.exclusions),
    image: p.image || null,
    imageAlt: p.imageAlt || null,
    gallery: p.gallery,
    featured: p.featured,
    published: p.published,
    order: Number(p.order),
    seoTitle: p.seoTitle || null,
    seoDescription: p.seoDescription || null,
  };

  const itineraryRows = p.itinerary.map((day, index) => ({
    day: index + 1,
    title: day.title,
    description: day.description,
  }));

  try {
    if (id) {
      const existing = await prisma.package.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return failure("That package no longer exists.");
      }
      await prisma.package.update({
        where: { id },
        data: {
          ...data,
          itinerary: {
            deleteMany: {},
            create: itineraryRows,
          },
        },
      });
      revalidatePackages(p.slug);
      if (existing.slug !== p.slug) revalidatePackages(existing.slug);
      return ok(`Updated “${p.title}”.`);
    }

    await prisma.package.create({
      data: { ...data, itinerary: { create: itineraryRows } },
    });
    revalidatePackages(p.slug);
    return ok(`Created “${p.title}”.`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("That slug is already used by another package.", {
        slug: ["This slug is already taken"],
      });
    }
    console.error("[admin:packages] save failed:", error);
    return failure("We couldn't save the package. Please try again.");
  }
}

export async function deletePackageAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.package.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });
    if (!existing) {
      return failure("That package no longer exists.");
    }
    await prisma.package.delete({ where: { id } });
    revalidatePackages(existing.slug);
    return ok(`Deleted “${existing.title}”.`);
  } catch (error) {
    console.error("[admin:packages] delete failed:", error);
    return failure("We couldn't delete that package. Please try again.");
  }
}

/** Read one package (with itinerary) for the edit form. */
export async function getPackageForEdit(id: string) {
  await requireAdmin();
  return safeAdminQuery(
    `packages.edit:${id}`,
    () =>
      prisma.package.findUnique({
        where: { id },
        include: { itinerary: { orderBy: { day: "asc" } } },
      }),
    null,
  );
}

/** Lightweight destination list for the package form select. */
export async function getDestinationOptions() {
  await requireAdmin();
  return safeAdminQuery(
    "packages.destinationOptions",
    () =>
      prisma.destination.findMany({
        select: { id: true, name: true, state: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    [],
  );
}
