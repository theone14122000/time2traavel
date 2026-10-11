"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/email";
import { reviewSchema, newsletterSchema, type ReviewInput, type NewsletterInput } from "@/schemas/forms";
import type { ActionResult } from "@/actions/inquiry";

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

export async function submitReviewAction(
  values: ReviewInput,
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  if (parsed.data.website) {
    return { ok: true, message: "Thanks for your review!" };
  }

  const h = await headers();
  const ip = await getClientIp(h);

  const limit = rateLimit({
    key: "review",
    limit: 4,
    windowMs: 30 * 60 * 1000,
    ip,
  });
  if (!limit.success) {
    return {
      ok: false,
      error: `Too many submissions — please try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  try {
    await prisma.review.create({
      data: {
        name: parsed.data.name,
        context: parsed.data.context || null,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error(
      "[review] failed to save:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: "We couldn't save your review right now. Please try again.",
    };
  }

  void notifyAdmin({
    subject: "[Time to Travel] New review awaiting approval",
    text: [
      `Name: ${parsed.data.name}`,
      `Context: ${parsed.data.context || "—"}`,
      `Rating: ${parsed.data.rating}/5`,
      ``,
      parsed.data.comment,
    ].join("\n"),
  });

  revalidatePath("/");
  return {
    ok: true,
    message: "Thank you! Your review is queued for approval.",
  };
}

export async function subscribeNewsletterAction(
  values: NewsletterInput,
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please enter a valid email address.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  if (parsed.data.website) {
    return { ok: true, message: "You're on the list!" };
  }

  const h = await headers();
  const ip = await getClientIp(h);
  const limit = rateLimit({
    key: "newsletter",
    limit: 5,
    windowMs: 60 * 60 * 1000,
    ip,
  });
  if (!limit.success) {
    return {
      ok: false,
      error: `Too many attempts — please try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase() },
      update: { active: true },
    });
  } catch (error) {
    console.error(
      "[newsletter] failed:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: "We couldn't add you right now. Please try again later.",
    };
  }

  return { ok: true, message: "You're on the list — welcome aboard!" };
}
