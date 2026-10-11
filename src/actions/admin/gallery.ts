"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import {
  galleryItemCreateSchema,
  galleryItemUpdateSchema,
  type GalleryItemCreateInput,
  type GalleryItemUpdateInput,
} from "@/schemas/admin";
import { uploadMediaAction } from "@/actions/admin/media";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateGallery() {
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/destinations");
}

/**
 * Upload a file through the shared media endpoint, then register it as a
 * gallery item. Reuses `uploadMediaAction` — no duplicated upload logic.
 */
export async function uploadGalleryItemAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const alt = String(formData.get("alt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "General";
  const caption = String(formData.get("caption") ?? "").trim();
  const destinationId = String(formData.get("destinationId") ?? "").trim();

  if (!alt) {
    return failure("Please fix the highlighted fields.", {
      alt: ["Alt text is required"],
    });
  }

  const upload = await uploadMediaAction(formData);
  if (!upload.ok) return upload;

  // uploadMediaAction reports success as `Uploaded <filename>.`
  const match = /^Uploaded (.+)\.$/.exec(upload.message);
  if (!match?.[1]) {
    return failure("Upload succeeded but the file name couldn't be read — try again.");
  }
  const url = `/uploads/${match[1]}`;

  try {
    await prisma.galleryItem.create({
      data: {
        url,
        alt,
        category,
        caption: caption || null,
        destinationId: destinationId || null,
      },
    });
  } catch (error) {
    console.error("[admin:gallery] create after upload failed:", error);
    return failure("We couldn't register the gallery item. Please try again.");
  }

  revalidateGallery();
  return ok("Gallery item added.");
}

/** Add an existing image (pasted URL) to the gallery. */
export async function createGalleryItemAction(
  values: GalleryItemCreateInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = galleryItemCreateSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const g = parsed.data;
  try {
    await prisma.galleryItem.create({
      data: {
        url: g.url,
        alt: g.alt,
        category: g.category,
        caption: g.caption || null,
        destinationId: g.destinationId || null,
      },
    });
    revalidateGallery();
    return ok("Gallery item added.");
  } catch (error) {
    console.error("[admin:gallery] create failed:", error);
    return failure("We couldn't add that gallery item. Please try again.");
  }
}

export async function updateGalleryItemAction(
  values: GalleryItemUpdateInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = galleryItemUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const g = parsed.data;
  try {
    const existing = await prisma.galleryItem.findUnique({
      where: { id: g.id },
      select: { id: true },
    });
    if (!existing) {
      return failure("That gallery item no longer exists.");
    }
    await prisma.galleryItem.update({
      where: { id: g.id },
      data: {
        url: g.url,
        alt: g.alt,
        category: g.category,
        caption: g.caption || null,
        destinationId: g.destinationId || null,
      },
    });
    revalidateGallery();
    return ok("Gallery item updated.");
  } catch (error) {
    console.error("[admin:gallery] update failed:", error);
    return failure("We couldn't update that gallery item. Please try again.");
  }
}

export async function deleteGalleryItemAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const existing = await prisma.galleryItem.findUnique({
      where: { id },
      select: { id: true, alt: true },
    });
    if (!existing) {
      return failure("That gallery item no longer exists.");
    }
    await prisma.galleryItem.delete({ where: { id } });
    revalidateGallery();
    return ok("Gallery item deleted.");
  } catch (error) {
    console.error("[admin:gallery] delete failed:", error);
    return failure("We couldn't delete that gallery item. Please try again.");
  }
}

/** Swap an item with its neighbour in display order. */
export async function moveGalleryItemAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireAdmin();

  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, order: true },
    });
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return failure("That gallery item no longer exists.");
    }
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const neighbor = items[swapIndex];
    if (!neighbor) {
      return ok("Already at the top of the list.");
    }

    const current = items[index];
    if (!current) {
      return failure("That gallery item no longer exists.");
    }
    await prisma.$transaction([
      prisma.galleryItem.update({
        where: { id: current.id },
        data: { order: neighbor.order },
      }),
      prisma.galleryItem.update({
        where: { id: neighbor.id },
        data: { order: current.order },
      }),
    ]);

    revalidateGallery();
    return ok("Order updated.");
  } catch (error) {
    console.error("[admin:gallery] move failed:", error);
    return failure("We couldn't reorder that gallery item. Please try again.");
  }
}
