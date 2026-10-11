"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { idSchema, reviewStatusSchema } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

export async function moderateReviewAction(
  values: { id: string; status: "APPROVED" | "REJECTED" },
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reviewStatusSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Invalid review action.", toFieldErrors(parsed.error));
  }

  try {
    const existing = await prisma.review.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return failure("That review no longer exists.");
    }

    await prisma.review.update({
      where: { id: parsed.data.id },
      data:
        parsed.data.status === "APPROVED"
          ? { status: "APPROVED", approvedAt: new Date() }
          : { status: "REJECTED", approvedAt: null },
    });

    revalidateReviews();
    return ok(
      parsed.data.status === "APPROVED"
        ? `Approved the review from ${existing.name}.`
        : `Rejected the review from ${existing.name}.`,
    );
  } catch (error) {
    console.error("[admin:reviews] moderate failed:", error);
    return failure("We couldn't update that review. Please try again.");
  }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return failure("Missing review id.");
  }

  try {
    const existing = await prisma.review.findUnique({
      where: { id: parsed.data },
      select: { id: true, name: true },
    });
    if (!existing) {
      return failure("That review no longer exists.");
    }
    await prisma.review.delete({ where: { id: parsed.data } });
    revalidateReviews();
    return ok(`Deleted the review from ${existing.name}.`);
  } catch (error) {
    console.error("[admin:reviews] delete failed:", error);
    return failure("We couldn't delete that review. Please try again.");
  }
}
