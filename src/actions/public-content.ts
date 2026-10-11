"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/email";
import { reviewSchema, newsletterSchema, type ReviewInput, type NewsletterInput } from "@/schemas/forms";
import type { ActionResult } from "@/actions/inquiry";
import type { DestinationCard } from "@/lib/data/destinations";
import type { PackageCard } from "@/lib/data/packages";

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

/* ---------------------------------------------------------------
   Saved items (localStorage wishlist) — server-side hydrate
--------------------------------------------------------------- */

const idListSchema = z
  .array(z.string().trim().regex(/^[A-Za-z0-9_-]{1,64}$/, "Invalid id").max(64))
  .max(40)
  .optional();

const savedItemsSchema = z.object({
  destinationIds: idListSchema,
  packageIds: idListSchema,
});

export type SavedItemsInput = z.infer<typeof savedItemsSchema>;

const destinationCardSelect = {
  id: true,
  slug: true,
  name: true,
  state: true,
  region: true,
  summary: true,
  image: true,
  imageAlt: true,
  featured: true,
  order: true,
} as const;

const packageCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  durationDays: true,
  durationLabel: true,
  price: true,
  currency: true,
  priceNote: true,
  image: true,
  imageAlt: true,
  featured: true,
  order: true,
  destination: { select: { slug: true, name: true, state: true } },
} as const;

/**
 * Hydrates the saved-items page: turns stored ids into real published cards.
 * Returns card data only (public fields) — rate-limited per IP.
 */
export async function getSavedItemsAction(input: SavedItemsInput): Promise<{
  ok: boolean;
  error?: string;
  destinations: DestinationCard[];
  packages: PackageCard[];
}> {
  const parsed = savedItemsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { ok: false, error: "Those saved items look invalid.", destinations: [], packages: [] };
  }

  const h = await headers();
  const ip = await getClientIp(h);
  const limit = rateLimit({
    key: "saved-items",
    limit: 40,
    windowMs: 10 * 60 * 1000,
    ip,
  });
  if (!limit.success) {
    return {
      ok: false,
      error: `Too many lookups — please try again in ${limit.retryAfterSeconds}s.`,
      destinations: [],
      packages: [],
    };
  }

  const destinationIds = parsed.data.destinationIds ?? [];
  const packageIds = parsed.data.packageIds ?? [];

  const [destinations, packages] = await Promise.all([
    destinationIds.length > 0
      ? safeQuery(
          "savedItems.destinations",
          () =>
            prisma.destination.findMany({
              where: { id: { in: destinationIds }, published: true },
              select: destinationCardSelect,
            }),
          [],
        )
      : Promise.resolve([]),
    packageIds.length > 0
      ? safeQuery(
          "savedItems.packages",
          () =>
            prisma.package.findMany({
              where: { id: { in: packageIds }, published: true },
              select: packageCardSelect,
            }),
          [],
        )
      : Promise.resolve([]),
  ]);

  return { ok: true, destinations, packages };
}
