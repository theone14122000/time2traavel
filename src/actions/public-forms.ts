"use server";

import { z } from "zod";
import { submitInquiry, type ActionResult } from "@/actions/inquiry";
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
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;
  return submitInquiry({
    type: "GENERAL",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    subject: "Website contact form",
    honeypot: data.website,
  });
}

export async function submitTripPlanAction(
  values: TripPlanInput,
): Promise<ActionResult> {
  const parsed = tripPlanSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;
  return submitInquiry({
    type: "TRIP_PLAN",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.specialRequests
      ? `Special requests: ${data.specialRequests}`
      : "Trip planning request from the website.",
    subject: `Trip to ${data.destination}`,
    destinationSlug: data.destination,
    travelDate: data.travelDate,
    endDate: data.endDate || null,
    travellers: data.travellers,
    budgetRange: data.budgetRange,
    tripType: data.tripType,
    specialRequests: data.specialRequests,
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
