"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { inquiryUpdateSchema, type InquiryUpdateInput } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateInquiries() {
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
}

export async function updateInquiryAction(
  values: InquiryUpdateInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = inquiryUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  try {
    const existing = await prisma.inquiry.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return failure("That enquiry no longer exists.");
    }

    await prisma.inquiry.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes?.trim() || null,
      },
    });

    revalidateInquiries();
    revalidatePath(`/admin/inquiries/${parsed.data.id}`);
    return ok(`Updated the enquiry from ${existing.name}.`);
  } catch (error) {
    console.error("[admin:inquiries] update failed:", error);
    return failure("We couldn't update that enquiry. Please try again.");
  }
}
