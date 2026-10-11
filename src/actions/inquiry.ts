import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { notifyNewInquiry } from "@/lib/email";
import type { InquiryType, Prisma } from "@prisma/client";

export type ActionSuccess = { ok: true; message: string };
export type ActionFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};
export type ActionResult = ActionSuccess | ActionFailure;

function failure(error: string, fieldErrors?: Record<string, string[]>): ActionFailure {
  return { ok: false, error, fieldErrors };
}

export type PublicInquiryInput = {
  type: InquiryType;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  subject?: string | null;
  packageSlug?: string | null;
  destinationSlug?: string | null;
  travelDate?: string | null;
  endDate?: string | null;
  travellers?: string | null;
  budgetRange?: string | null;
  tripType?: string | null;
  specialRequests?: string | null;
  /** Value of the hidden "website" honeypot field — must stay empty. */
  honeypot?: string | null;
};

/** Shared intake for every public form: honeypot + rate limit + DB + email. */
export async function submitInquiry(input: PublicInquiryInput): Promise<ActionResult> {
  const h = await headers();
  const ip = await getClientIp(h);
  const userAgent = h.get("user-agent");

  // Honeypot: pretend success so bots don't adapt.
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { ok: true, message: "Thanks — we'll be in touch shortly." };
  }

  const limit = rateLimit({
    key: `inquiry:${input.type}`,
    limit: 6,
    windowMs: 10 * 60 * 1000,
    ip,
  });
  if (!limit.success) {
    return failure(
      `Too many requests — please try again in ${limit.retryAfterSeconds}s.`,
    );
  }

  let packageId: string | undefined;
  let destinationId: string | undefined;

  try {
    if (input.packageSlug) {
      const pkg = await prisma.package.findUnique({
        where: { slug: input.packageSlug },
        select: { id: true },
      });
      packageId = pkg?.id;
    }
    if (input.destinationSlug) {
      const dest = await prisma.destination.findUnique({
        where: { slug: input.destinationSlug },
        select: { id: true },
      });
      destinationId = dest?.id;
    }

    const travellers = Number.parseInt(input.travellers ?? "", 10);
    const travelDate = input.travelDate ? new Date(input.travelDate) : null;
    const endDate = input.endDate ? new Date(input.endDate) : null;

    await prisma.inquiry.create({
      data: {
        type: input.type,
        status: "NEW",
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        message: input.message?.trim() || null,
        subject: input.subject?.trim() || null,
        packageId: packageId ?? null,
        destinationId: destinationId ?? null,
        travelDate: travelDate && !Number.isNaN(travelDate.getTime()) ? travelDate : null,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
        travellers:
          Number.isFinite(travellers) && travellers > 0 ? travellers : null,
        budgetRange: input.budgetRange?.trim() || null,
        tripType: input.tripType?.trim() || null,
        specialRequests: input.specialRequests?.trim() || null,
        ipHash: ip ? ip : null,
        userAgent: userAgent?.slice(0, 250) ?? null,
      } satisfies Prisma.InquiryCreateInput,
    });
  } catch (error) {
    console.error(
      "[inquiry] failed to save:",
      error instanceof Error ? error.message : error,
    );
    return failure(
      "We couldn't save your enquiry right now. Please try again in a moment.",
    );
  }

  // Optional notification — silently skipped when not configured.
  void notifyNewInquiry({
    type: input.type,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    details: {
      Subject: input.subject,
      Package: input.packageSlug,
      Destination: input.destinationSlug,
      "Travel date": input.travelDate,
      Travellers: input.travellers,
      Budget: input.budgetRange,
      "Trip type": input.tripType,
    },
  });

  return {
    ok: true,
    message: "Thanks! Your enquiry is with us — we'll get back to you shortly.",
  };
}
