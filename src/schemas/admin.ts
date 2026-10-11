import { z } from "zod";
import { CONTENT_KEYS } from "@/lib/constants";

/* ---------------------------------------------------------------
   Shared field helpers

   NOTE: numeric form fields are plain strings here (and converted in
   the server actions) so zod input/output types stay identical —
   required by react-hook-form + zodResolver.
--------------------------------------------------------------- */

const slugField = z
  .string()
  .trim()
  .min(2, "Slug is too short")
  .max(96, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

const optionalText = (max: number, message?: string) =>
  z
    .string()
    .trim()
    .max(max, message ?? `Keep it under ${max} characters`)
    .optional()
    .or(z.literal(""));

const urlField = z
  .string()
  .trim()
  .max(500, "URL is too long")
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "Enter a full URL (https://…) or a site path starting with /",
  );

const integerString = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^-?\d+$/, message)
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= min && n <= max;
    }, message);

const orderField = integerString(-10_000, 100_000, "Enter a whole number");
const durationDaysField = integerString(1, 90, "Enter a duration of 1–90 days");

/** Empty string or whole number (nullable price, stored as Int in DB). */
const priceField = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\d{1,9}$/, "Enter a whole number (no decimals)"),
  ])
  .optional();

/* ---------------------------------------------------------------
   Gallery rows (repeatable URL + alt)
--------------------------------------------------------------- */
export const galleryImageSchema = z.object({
  url: urlField.refine((v) => v !== "", "Image URL is required"),
  alt: optionalText(200),
});
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

/* ---------------------------------------------------------------
   1. Destinations
--------------------------------------------------------------- */
export const destinationSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
  slug: slugField,
  state: z.string().trim().min(2, "State is required").max(120, "State is too long"),
  region: optionalText(120),
  summary: optionalText(320, "Summary should stay under 320 characters"),
  description: optionalText(20_000),
  bestTimeToVisit: optionalText(20_000),
  image: urlField,
  imageAlt: optionalText(200),
  gallery: z.array(galleryImageSchema).max(20, "Up to 20 images"),
  featured: z.boolean(),
  published: z.boolean(),
  order: orderField,
  seoTitle: optionalText(160, "Keep the SEO title under 160 characters"),
  seoDescription: optionalText(320, "Keep the SEO description under 320 characters"),
});
export type DestinationInput = z.infer<typeof destinationSchema>;

/* ---------------------------------------------------------------
   2. Packages
--------------------------------------------------------------- */
export const itineraryDaySchema = z.object({
  title: z.string().trim().min(2, "Day title is required").max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(5, "Describe the day in a few words")
    .max(5_000, "Keep each day under 5000 characters"),
});
export type ItineraryDayInput = z.infer<typeof itineraryDaySchema>;

export const packageSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(160, "Title is too long"),
  slug: slugField,
  summary: optionalText(320, "Summary should stay under 320 characters"),
  description: optionalText(40_000),
  destinationId: z.string().trim().optional().or(z.literal("")),
  durationDays: durationDaysField,
  durationLabel: optionalText(80),
  price: priceField,
  currency: z.string().trim().min(3, "Currency is required").max(8, "Too long"),
  priceNote: optionalText(200),
  highlights: optionalText(10_000),
  inclusions: optionalText(10_000),
  exclusions: optionalText(10_000),
  image: urlField,
  imageAlt: optionalText(200),
  gallery: z.array(galleryImageSchema).max(20, "Up to 20 images"),
  itinerary: z.array(itineraryDaySchema).max(60, "Up to 60 days"),
  featured: z.boolean(),
  published: z.boolean(),
  order: orderField,
  seoTitle: optionalText(160, "Keep the SEO title under 160 characters"),
  seoDescription: optionalText(320, "Keep the SEO description under 320 characters"),
});
export type PackageInput = z.infer<typeof packageSchema>;

/* ---------------------------------------------------------------
   3. Reviews moderation
--------------------------------------------------------------- */
export const idSchema = z.string().trim().min(1, "Missing record id");

export const reviewStatusSchema = z.object({
  id: idSchema,
  status: z.enum(["APPROVED", "REJECTED"]),
});
export type ReviewStatusInput = z.infer<typeof reviewStatusSchema>;

/* ---------------------------------------------------------------
   4. Inquiries
--------------------------------------------------------------- */
export const inquiryUpdateSchema = z.object({
  id: idSchema,
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
  adminNotes: optionalText(5_000),
});
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;

/* ---------------------------------------------------------------
   5. FAQs
--------------------------------------------------------------- */
export const faqSchema = z.object({
  question: z.string().trim().min(3, "Question is required").max(300, "Question is too long"),
  answer: z.string().trim().min(3, "Answer is required").max(10_000, "Answer is too long"),
  category: z.string().trim().min(1, "Category is required").max(80, "Category is too long"),
  order: orderField,
  published: z.boolean(),
});
export type FaqInput = z.infer<typeof faqSchema>;

/* ---------------------------------------------------------------
   6. Newsletter
--------------------------------------------------------------- */
export const newsletterDeleteSchema = z.object({ id: idSchema });

/* ---------------------------------------------------------------
   7. Media
--------------------------------------------------------------- */
export const mediaDeleteSchema = z.object({ id: idSchema });
export const mediaAltSchema = z.object({
  id: idSchema,
  alt: z.string().trim().min(1, "Alt text is required").max(300, "Alt text is too long"),
});

/* ---------------------------------------------------------------
   8. Site settings
--------------------------------------------------------------- */
export const socialLinkSchema = z.object({
  platform: z.string().trim().min(2, "Platform is required").max(60, "Too long"),
  url: urlField.refine((v) => v !== "", "URL is required"),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(120, "Too long"),
  tagline: optionalText(200),
  phone: optionalText(30),
  whatsapp: optionalText(30),
  email: z
    .string()
    .trim()
    .max(200, "Too long")
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email",
    ),
  address: z.string().trim().min(3, "Address is required").max(400, "Too long"),
  workingHours: optionalText(200),
  mapEmbedUrl: urlField,
  socials: z.array(socialLinkSchema).max(10, "Up to 10 links"),
  heroTitle: optionalText(200),
  heroSubtitle: optionalText(400),
  metaTitle: optionalText(160, "Keep the meta title under 160 characters"),
  metaDescription: optionalText(320, "Keep the meta description under 320 characters"),
  ogImage: urlField,
  footerNote: optionalText(400),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

/* ---------------------------------------------------------------
   9. Page content editor
--------------------------------------------------------------- */
export const CONTENT_KEY_VALUES = Object.values(CONTENT_KEYS) as [
  string,
  ...string[],
];

export const contentSchema = z.object({
  key: z.enum(CONTENT_KEY_VALUES),
  title: optionalText(200),
  body: optionalText(40_000),
  /** Raw JSON from the textarea — parsed (and type-checked) in the action. */
  data: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const trimmed = value?.trim();
      if (!trimmed) return;
      try {
        JSON.parse(trimmed);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Data must be valid JSON (double-quoted keys and strings).",
        });
      }
    }),
});
export type ContentInput = z.infer<typeof contentSchema>;
