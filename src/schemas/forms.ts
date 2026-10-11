import { z } from "zod";
import { BUDGET_RANGES, TRAVELLER_COUNTS, TRIP_TYPES } from "@/lib/constants";

/** Honeypot field — must stay empty. Filled by bots → silently dropped. */
const honeypot = z.string().max(0).optional().or(z.literal(""));

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Pick a valid date");

const nameField = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(120, "Name is too long");

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(200, "Email is too long")
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email");

const phoneField = z
  .string()
  .trim()
  .max(25, "Phone number is too long")
  .refine(
    (v) => v === "" || /^[+()\d\s-]{7,25}$/.test(v),
    "Enter a valid phone number",
  )
  .optional()
  .or(z.literal(""));

const messageField = z
  .string()
  .trim()
  .min(10, "Please add a few more details (10+ characters)")
  .max(5000, "Message is too long");

const travellersField = z
  .string()
  .trim()
  .refine((v) => v === "" || TRAVELLER_COUNTS.includes(v as never) || /^\d{1,3}$/.test(v), "Enter the number of travellers")
  .optional()
  .or(z.literal(""));

/* ---------------------------------------------------------------
   1. General inquiry / contact
--------------------------------------------------------------- */
export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  message: messageField,
  website: honeypot,
});
export type ContactInput = z.infer<typeof contactSchema>;

/* ---------------------------------------------------------------
   2. Trip planning (multi-step, submitted once at the end)
--------------------------------------------------------------- */
export const tripPlanSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(2, "Where do you want to go?")
      .max(200, "Destination is too long"),
    travelDate: dateString,
    endDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")
      .optional()
      .or(z.literal("")),
    travellers: travellersField,
    budgetRange: z
      .enum([...BUDGET_RANGES] as [string, ...string[]])
      .or(z.literal(""))
      .optional(),
    tripType: z
      .enum([...TRIP_TYPES] as [string, ...string[]])
      .or(z.literal(""))
      .optional(),
    specialRequests: z
      .string()
      .trim()
      .max(3000, "Please keep it under 3000 characters")
      .optional()
      .or(z.literal("")),
    name: nameField,
    email: emailField,
    phone: phoneField,
    website: honeypot,
  })
  .refine(
    (v) =>
      !v.endDate ||
      new Date(v.endDate).getTime() >= new Date(v.travelDate).getTime(),
    { message: "End date must be after the start date", path: ["endDate"] },
  );
export type TripPlanInput = z.infer<typeof tripPlanSchema>;

/* ---------------------------------------------------------------
   3. Package enquiry (pre-filled with a package)
--------------------------------------------------------------- */
export const packageEnquirySchema = z.object({
  packageSlug: z.string().min(1),
  packageTitle: z.string().min(1),
  name: nameField,
  email: emailField,
  phone: phoneField,
  travelDate: dateString.optional().or(z.literal("")),
  travellers: travellersField,
  message: z
    .string()
    .trim()
    .max(5000, "Message is too long")
    .optional()
    .or(z.literal("")),
  website: honeypot,
});
export type PackageEnquiryInput = z.infer<typeof packageEnquirySchema>;

/* ---------------------------------------------------------------
   4. Destination enquiry (pre-filled with a destination)
--------------------------------------------------------------- */
export const destinationEnquirySchema = z.object({
  destinationSlug: z.string().min(1),
  destinationName: z.string().min(1),
  name: nameField,
  email: emailField,
  phone: phoneField,
  travelDate: dateString.optional().or(z.literal("")),
  travellers: travellersField,
  message: z
    .string()
    .trim()
    .max(5000, "Message is too long")
    .optional()
    .or(z.literal("")),
  website: honeypot,
});
export type DestinationEnquiryInput = z.infer<typeof destinationEnquirySchema>;

/* ---------------------------------------------------------------
   5. Review submission (saved as PENDING for admin approval)
--------------------------------------------------------------- */
export const reviewSchema = z.object({
  name: nameField,
  context: z
    .string()
    .trim()
    .max(200, "Destination or package name is too long")
    .optional()
    .or(z.literal("")),
  rating: z.coerce
    .number({ message: "Choose a rating" })
    .int("Choose a rating")
    .min(1, "Choose 1–5")
    .max(5, "Choose 1–5"),
  comment: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters")
    .max(3000, "Review is too long"),
  website: honeypot,
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/* ---------------------------------------------------------------
   6. Newsletter
--------------------------------------------------------------- */
export const newsletterSchema = z.object({
  email: emailField,
  website: honeypot,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

/* ---------------------------------------------------------------
   Admin login
--------------------------------------------------------------- */
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;
