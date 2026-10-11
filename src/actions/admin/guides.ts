"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { guidePostSchema, type GuidePostInput } from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateGuides(slug?: string) {
  revalidatePath("/admin/guides");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/guides");
  if (slug) revalidatePath(`/guides/${slug}`);
}

export async function saveGuidePostAction(
  id: string | null,
  values: GuidePostInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = guidePostSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const g = parsed.data;
  const data = {
    title: g.title,
    slug: g.slug,
    excerpt: g.excerpt || null,
    body: g.body || null,
    category: g.category,
    coverImage: g.coverImage || null,
    coverImageAlt: g.coverImageAlt || null,
    readingMinutes: g.readingMinutes?.trim() ? Number(g.readingMinutes) : null,
    seoTitle: g.seoTitle || null,
    seoDescription: g.seoDescription || null,
    published: g.published,
  };

  try {
    if (id) {
      const existing = await prisma.guidePost.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });
      if (!existing) {
        return failure("That guide no longer exists.");
      }
      await prisma.guidePost.update({ where: { id }, data });
      revalidateGuides(g.slug);
      if (existing.slug !== g.slug) revalidateGuides(existing.slug);
      return ok(`Updated “${g.title}”.`);
    }

    await prisma.guidePost.create({ data });
    revalidateGuides(g.slug);
    return ok(`Created “${g.title}”.`);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("That slug is already used by another guide.", {
        slug: ["This slug is already taken"],
      });
    }
    console.error("[admin:guides] save failed:", error);
    return failure("We couldn't save the guide. Please try again.");
  }
}

export async function deleteGuidePostAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.guidePost.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });
    if (!existing) {
      return failure("That guide no longer exists.");
    }
    await prisma.guidePost.delete({ where: { id } });
    revalidateGuides(existing.slug);
    return ok(`Deleted “${existing.title}”.`);
  } catch (error) {
    console.error("[admin:guides] delete failed:", error);
    return failure("We couldn't delete that guide. Please try again.");
  }
}

/** Read one guide post for the edit form. */
export async function getGuidePostForEdit(id: string) {
  await requireAdmin();
  return safeAdminQuery(
    `guides.edit:${id}`,
    () => prisma.guidePost.findUnique({ where: { id } }),
    null,
  );
}
