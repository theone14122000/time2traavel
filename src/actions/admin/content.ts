"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { contentSchema, type ContentInput } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

/** Public paths worth refreshing after any content edit. */
const PUBLIC_PATHS = ["/", "/about", "/contact", "/privacy", "/terms"];

export async function saveContentAction(
  values: ContentInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = contentSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const c = parsed.data;
  let data: unknown = null;
  const raw = c.data?.trim();
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      return failure("The data field must be valid JSON.", {
        data: ["Invalid JSON — check quotes, commas and brackets."],
      });
    }
  }

  try {
    await prisma.pageContent.upsert({
      where: { key: c.key },
      create: {
        key: c.key,
        title: c.title || null,
        body: c.body || null,
        data: data as never,
      },
      update: {
        title: c.title || null,
        body: c.body || null,
        data: data as never,
      },
    });
  } catch (error) {
    console.error("[admin:content] save failed:", error);
    return failure("We couldn't save that content block. Please try again.");
  }

  revalidatePath("/admin/content");
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/", "layout");
  return ok(`Saved content for “${c.key}”.`);
}
