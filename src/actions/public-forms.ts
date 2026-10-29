"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";
import { submitInquiry, type ActionResult, type PublicInquiryInput } from "@/actions/inquiry";
import {
  contactSchema,
  destinationEnquirySchema,
  packageEnquirySchema,
  tripPlanSchema,
  type ContactInput,
  type DestinationEnquiryInput,
  type PackageEnquiryInput,
  type TripPlanInput,
} from "@/schemas/forms";

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

function invalid(
  error: z.ZodError,
): ActionResult {
  return {
    ok: false,
    error: "Please check the highlighted fields and try again.",
    fieldErrors: toFieldErrors(error),
  };
}

export async function submitContactAction(
  values: ContactInput,
  options?: {
    /** Overrides the default "Website contact form" subject. */
    subject?: string;
    /** Inquiry type — service pages pass "SERVICE". */
    type?: PublicInquiryInput["type"];
  },
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;
  return submitInquiry({
    type: options?.type ?? "GENERAL",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    subject: options?.subject?.trim() || "Website contact form",
    honeypot: data.website,
  });
}

export async function submitTripPlanAction(
  values: TripPlanInput,
): Promise<ActionResult> {
  const parsed = tripPlanSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  const adults = Number(data.adults || 0);
  const children = Number(data.children || 0);
  const party = adults + children;
  const travellers = party > 0 ? String(party) : data.travellers;

  // Extra planner answers live in the existing free-text columns so admins see
  // them on the inquiry detail page without a schema change.
  const details = [
    data.departureCity && `Departing from: ${data.departureCity}`,
    data.flexibleDates === "yes" && "Dates are flexible",
    party > 0 &&
      `Party: ${adults} adult${adults === 1 ? "" : "s"}` +
        (children > 0
          ? `, ${children} child${children === 1 ? "" : "ren"} (ages: ${data.childAges})`
          : ""),
    data.stayType && `Stay preference: ${data.stayType}`,
    data.interests && `Interests: ${data.interests.split(",").join(", ")}`,
    data.contactMethod && `Preferred contact: ${data.contactMethod}`,
    data.specialRequests && `Special requests: ${data.specialRequests}`,
  ].filter(Boolean) as string[];

  return submitInquiry({
    type: "TRIP_PLAN",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: details.length ? details.join("\n") : "Trip planning request from the website.",
    subject: `Trip to ${data.destination}`,
    destinationSlug: data.destination,
    travelDate: data.travelDate,
    endDate: data.endDate || null,
    travellers,
    budgetRange: data.budgetRange,
    tripType: data.tripType,
    specialRequests: details.join("\n") || null,
    honeypot: data.website,
  });
}

export async function submitPackageEnquiryAction(
  values: PackageEnquiryInput,
): Promise<ActionResult> {
  const parsed = packageEnquirySchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;
  return submitInquiry({
    type: "PACKAGE",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    subject: `Enquiry about ${data.packageTitle}`,
    packageSlug: data.packageSlug,
    travelDate: data.travelDate,
    travellers: data.travellers,
    honeypot: data.website,
  });
}

export async function submitDestinationEnquiryAction(
  values: DestinationEnquiryInput,
): Promise<ActionResult> {
  const parsed = destinationEnquirySchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;
  return submitInquiry({
    type: "DESTINATION",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    subject: `Enquiry about ${data.destinationName}`,
    destinationSlug: data.destinationSlug,
    travelDate: data.travelDate,
    travellers: data.travellers,
    honeypot: data.website,
  });
}

/* ---------------------------------------------------------------
   6. Track an existing enquiry by reference id + contact detail
--------------------------------------------------------------- */

const trackInquirySchema = z
  .object({
    refId: z
      .string()
      .trim()
      .min(4, "Enter the reference id from your enquiry confirmation")
      .max(64, "Reference id is too long"),
    phone: z
      .string()
      .trim()
      .max(25, "Phone number is too long")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .max(200, "Email is too long")
      .optional()
      .or(z.literal("")),
  })
  .refine((value) => Boolean(value.phone) || Boolean(value.email), {
    message: "Add the phone number or email you used for the enquiry",
    path: ["_form"],
  });

export type TrackInquiryInput = z.infer<typeof trackInquirySchema>;

export type TrackInquiryResult =
  | {
      ok: true;
      match: {
        status: "NEW" | "IN_PROGRESS" | "QUOTED" | "CONTACTED" | "CLOSED";
        type: "GENERAL" | "TRIP_PLAN" | "PACKAGE" | "DESTINATION" | "SERVICE";
        createdAt: string;
      };
    }
  | { ok: false; error: string; notFound?: boolean; fieldErrors?: Record<string, string[]> };

/**
 * Public enquiry tracking: matches a reference id AND one contact detail.
 * Returns only status / type / createdAt — never the traveller's name or
 * message. Rate-limited per IP.
 */
export async function trackInquiryAction(
  values: TrackInquiryInput,
): Promise<TrackInquiryResult> {
  const parsed = trackInquirySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      ok: false,
      error: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const h = await headers();
  const ip = await getClientIp(h);
  const limit = rateLimit({
    key: "track-inquiry",
    limit: 10,
    windowMs: 10 * 60 * 1000,
    ip,
  });
  if (!limit.success) {
    return {
      ok: false,
      error: `Too many lookups — please try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const { refId, phone, email } = parsed.data;
  const contactOr: Prisma.InquiryWhereInput[] = [];
  if (phone) contactOr.push({ phone });
  if (email) contactOr.push({ email });

  const row = await safeInquiryLookup(refId, contactOr);
  if (!row) {
    return {
      ok: false,
      notFound: true,
      error: "No enquiry matches those details.",
    };
  }

  return {
    ok: true,
    match: {
      status: row.status,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
    },
  };
}

async function safeInquiryLookup(
  refId: string,
  contactOr: Prisma.InquiryWhereInput[],
) {
  try {
    return await prisma.inquiry.findFirst({
      where: {
        refId,
        OR: contactOr,
      },
      select: { status: true, type: true, createdAt: true },
    });
  } catch (error) {
    console.error(
      "[trackInquiry] lookup failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
