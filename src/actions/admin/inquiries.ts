"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { inquiryUpdateSchema, type InquiryUpdateInput } from "@/schemas/admin";
import {
  failure,
  ok,
  safeAdminQuery,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateInquiries() {
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
}

/** `TTT-` + 6 unambiguous alphanumerics (no 0/O/1/I). */
const REF_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate a public reference id for a new enquiry. */
export async function generateInquiryRefId(): Promise<string> {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += REF_ID_ALPHABET[Math.floor(Math.random() * REF_ID_ALPHABET.length)];
  }
  return `TTT-${code}`;
}

/** Staff options for the assignee select (guarded by requireAdmin). */
export async function getUserOptionsAction() {
  await requireAdmin();
  return safeAdminQuery(
    "inquiries.userOptions",
    () =>
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        orderBy: [{ name: "asc" }, { email: "asc" }],
      }),
    [],
  );
}

export async function updateInquiryAction(
  values: InquiryUpdateInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = inquiryUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const assigneeId = parsed.data.assigneeId?.trim() || null;

  try {
    const existing = await prisma.inquiry.findUnique({
      where: { id: parsed.data.id },
      select: { id: true, name: true, refId: true },
    });
    if (!existing) {
      return failure("That enquiry no longer exists.");
    }

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
        select: { id: true },
      });
      if (!assignee) {
        return failure("Please fix the highlighted fields.", {
          assigneeId: ["That staff member no longer exists"],
        });
      }
    }

    await prisma.inquiry.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes?.trim() || null,
        assigneeId,
        // Backfill a reference id for enquiries created before it existed.
        refId: existing.refId ?? (await generateInquiryRefId()),
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
