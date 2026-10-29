"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { removeStoredFile, storeUpload } from "@/lib/uploads";
import { mediaDeleteSchema } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateMedia() {
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const stored = await storeUpload(formData.get("file"), {
    alt: String(formData.get("alt") ?? ""),
    region: String(formData.get("region") ?? ""),
  });
  if (!stored.ok) return failure(stored.error);

  revalidateMedia();
  return ok(`Uploaded ${stored.filename}.`);
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
    // Best-effort file removal — the DB row is already gone.
    await removeStoredFile(asset);

    revalidateMedia();
    return ok("Asset deleted.");
  } catch (error) {
    console.error("[admin:media] delete failed:", error);
    return failure("We couldn't delete that asset. Please try again.");
  }
}
