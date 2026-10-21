"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { slugify } from "@/lib/utils";
import { mediaDeleteSchema } from "@/schemas/admin";
import {
  failure,
  isUniqueViolation,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB

/** MIME type → extension. Anything else is rejected. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function uploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

function revalidateMedia() {
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const alt = String(formData.get("alt") ?? "").trim();
  const region = String(formData.get("region") ?? "UNASSIGNED").trim() || "UNASSIGNED";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return failure("Choose an image to upload.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return failure("Image is too large — the limit is 4MB.");
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return failure("Only JPG, PNG, WEBP and SVG images are allowed.");
  }

  const originalBase = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const filename = `${originalBase}-${Date.now()}.${extension}`;
  const absolutePath = path.join(uploadsDir(), filename);

  try {
    await fs.mkdir(uploadsDir(), { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, bytes);
  } catch (error) {
    console.error("[admin:media] file write failed:", error);
    return failure("We couldn't save the file. Please try again.");
  }

  const url = `/uploads/${filename}`;
  try {
    await prisma.mediaAsset.create({
      data: {
        url,
        alt: alt || originalBase.replace(/-/g, " "),
        region,
        provider: "LOCAL",
        publicId: filename,
      },
    });
  } catch (error) {
    // Don't leave orphan files on disk if the DB write fails.
    await fs.unlink(absolutePath).catch(() => undefined);
    if (isUniqueViolation(error)) {
      return failure("A file with that name already exists — try again.");
    }
    console.error("[admin:media] db write failed:", error);
    return failure("We couldn't register the upload. Please try again.");
  }

  revalidateMedia();
  return ok(`Uploaded ${filename}.`);
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = mediaDeleteSchema.safeParse({ id });
  if (!parsed.success) {
    return failure("Missing media id.", toFieldErrors(parsed.error));
  }

  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: parsed.data.id },
    });
    if (!asset) return failure("That asset no longer exists.");

    await prisma.mediaAsset.delete({ where: { id: parsed.data.id } });

    if (asset.provider === "LOCAL" && asset.url.startsWith("/uploads/")) {
      const absolutePath = path.join(uploadsDir(), path.basename(asset.url));
      // Best-effort file removal — the DB row is already gone.
      await fs.unlink(absolutePath).catch(() => undefined);
    }

    revalidateMedia();
    return ok("Asset deleted.");
  } catch (error) {
    console.error("[admin:media] delete failed:", error);
    return failure("We couldn't delete that asset. Please try again.");
  }
}
