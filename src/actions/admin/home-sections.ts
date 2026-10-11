"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import {
  homeSectionUpdateSchema,
  type HomeSectionUpdateInput,
} from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateHomeSections() {
  revalidatePath("/admin/home-sections");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function updateHomeSectionAction(
  values: HomeSectionUpdateInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = homeSectionUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const h = parsed.data;
  let config: Prisma.InputJsonValue | null = null;
  const trimmedConfig = h.config?.trim();
  if (trimmedConfig) {
    try {
      config = JSON.parse(trimmedConfig) as Prisma.InputJsonValue;
    } catch {
      return failure("Please fix the highlighted fields.", {
        config: ["Config must be valid JSON (double-quoted keys and strings)."],
      });
    }
  }

  try {
    const existing = await prisma.homeSection.findUnique({
      where: { id: h.id },
      select: { id: true, key: true },
    });
    if (!existing) {
      return failure("That section no longer exists.");
    }
    await prisma.homeSection.update({
      where: { id: h.id },
      data: { enabled: h.enabled, config: config ?? Prisma.DbNull },
    });
    revalidateHomeSections();
    return ok(`Updated “${existing.key}”.`);
  } catch (error) {
    console.error("[admin:home-sections] update failed:", error);
    return failure("We couldn't save that section. Please try again.");
  }
}

/** Swap a section with its neighbour in display order. */
export async function moveHomeSectionAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireAdmin();

  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: { order: "asc" },
      select: { id: true, key: true, order: true },
    });
    const index = sections.findIndex((section) => section.id === id);
    if (index === -1) {
      return failure("That section no longer exists.");
    }
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const neighbor = sections[swapIndex];
    if (!neighbor) {
      return ok("Already at the top of the list.");
    }

    const current = sections[index];
    if (!current) {
      return failure("That section no longer exists.");
    }
    await prisma.$transaction([
      prisma.homeSection.update({
        where: { id: current.id },
        data: { order: neighbor.order },
      }),
      prisma.homeSection.update({
        where: { id: neighbor.id },
        data: { order: current.order },
      }),
    ]);

    revalidateHomeSections();
    return ok("Order updated.");
  } catch (error) {
    console.error("[admin:home-sections] move failed:", error);
    return failure("We couldn't reorder that section. Please try again.");
  }
}
