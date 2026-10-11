"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { faqSchema, idSchema, type FaqInput } from "@/schemas/admin";
import {
  failure,
  ok,
  toFieldErrors,
  type ActionResult,
} from "@/actions/admin/shared";

function revalidateFaqs() {
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/faqs");
}

export async function saveFaqAction(
  id: string | null,
  values: FaqInput,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = faqSchema.safeParse(values);
  if (!parsed.success) {
    return failure("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const f = parsed.data;
  const data = {
    question: f.question,
    answer: f.answer,
    category: f.category,
    order: Number(f.order),
    published: f.published,
  };

  try {
    if (id) {
      const existing = await prisma.faq.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) return failure("That FAQ no longer exists.");
      await prisma.faq.update({ where: { id }, data });
      revalidateFaqs();
      return ok("FAQ updated.");
    }

    await prisma.faq.create({ data });
    revalidateFaqs();
    return ok("FAQ created.");
  } catch (error) {
    console.error("[admin:faqs] save failed:", error);
    return failure("We couldn't save that FAQ. Please try again.");
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return failure("Missing FAQ id.");

  try {
    const existing = await prisma.faq.findUnique({
      where: { id: parsed.data },
      select: { id: true },
    });
    if (!existing) return failure("That FAQ no longer exists.");
    await prisma.faq.delete({ where: { id: parsed.data } });
    revalidateFaqs();
    return ok("FAQ deleted.");
  } catch (error) {
    console.error("[admin:faqs] delete failed:", error);
    return failure("We couldn't delete that FAQ. Please try again.");
  }
}
