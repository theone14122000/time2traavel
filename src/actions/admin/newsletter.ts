"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { newsletterDeleteSchema } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateSubscribers() {
  revalidatePath("/admin/newsletters");
  revalidatePath("/admin/dashboard");
}

export async function deleteSubscriberAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = newsletterDeleteSchema.safeParse({ id });
  if (!parsed.success) {
    return failure("Missing subscriber id.", toFieldErrors(parsed.error));
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, email: true },
    });
    if (!existing) return failure("That subscriber no longer exists.");

    await prisma.newsletterSubscriber.delete({ where: { id: parsed.data.id } });
    revalidateSubscribers();
    return ok(`Removed ${existing.email}.`);
  } catch (error) {
    console.error("[admin:newsletter] delete failed:", error);
    return failure("We couldn't remove that subscriber. Please try again.");
  }
}

export async function toggleSubscriberAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = newsletterDeleteSchema.safeParse({ id });
  if (!parsed.success) {
    return failure("Missing subscriber id.", toFieldErrors(parsed.error));
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, email: true, active: true },
    });
    if (!existing) return failure("That subscriber no longer exists.");

    await prisma.newsletterSubscriber.update({
      where: { id: parsed.data.id },
      data: { active: !existing.active },
    });
    revalidateSubscribers();
    return ok(
      existing.active
        ? `Paused emails to ${existing.email}.`
        : `Resumed emails to ${existing.email}.`,
    );
  } catch (error) {
    console.error("[admin:newsletter] toggle failed:", error);
    return failure("We couldn't update that subscriber. Please try again.");
  }
}
