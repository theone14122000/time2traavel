import { z } from "zod";
import {
  BUDGET_RANGES,
  STAY_TYPES,
  TRIP_INTERESTS,
  TRIP_TYPES,
} from "@/lib/constants";

/** Limits shared by the widget (UX) and the API route (enforcement). */
export const GURU_LIMITS = {
  /** Characters in a single visitor message. */
  messageChars: 1000,
  /** Messages kept in the request (older ones are dropped client-side). */
  historyMessages: 12,
  /** Total characters across the whole request. */
  totalChars: 8000,
} as const;

export const guruMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(GURU_LIMITS.messageChars * 4),
});

export const guruRequestSchema = z
  .object({
    messages: z.array(guruMessageSchema).min(1).max(GURU_LIMITS.historyMessages),
    /** Path the visitor is on — gives GURU light page context. */
    path: z.string().max(200).optional(),
  })
  .refine((v) => v.messages[v.messages.length - 1]?.role === "user", {
    message: "The last message must come from the visitor",
  })
  .refine(
    (v) =>
      v.messages
        .filter((m) => m.role === "user")
        .every((m) => m.content.length <= GURU_LIMITS.messageChars),
    { message: "Message too long" },
  )
  .refine(
    (v) => v.messages.reduce((sum, m) => sum + m.content.length, 0) <= GURU_LIMITS.totalChars,
    { message: "Conversation too long" },
  );

export type GuruMessage = z.infer<typeof guruMessageSchema>;

/** Fields GURU may pass into the existing trip planner. All optional, all validated. */
export const tripInquiryActionSchema = z.object({
  type: z.literal("prepare_trip_inquiry"),
  tripType: z.enum([...TRIP_TYPES] as [string, ...string[]]).optional(),
  destination: z.string().trim().min(2).max(120),
  departureCity: z.string().trim().max(80).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().int().min(1).max(30).optional(),
  children: z.number().int().min(0).max(20).optional(),
  childAges: z.string().trim().max(60).optional(),
  budgetRange: z.enum([...BUDGET_RANGES] as [string, ...string[]]).optional(),
  stayType: z.enum([...STAY_TYPES] as [string, ...string[]]).optional(),
  interests: z.array(z.enum([...TRIP_INTERESTS] as [string, ...string[]])).max(6).optional(),
  notes: z.string().trim().max(400).optional(),
});

export const whatsappActionSchema = z.object({
  type: z.literal("offer_whatsapp"),
  summary: z.string().trim().min(3).max(500),
});

export const linksActionSchema = z.object({
  type: z.literal("show_links"),
  links: z
    .array(z.object({ path: z.string().max(200), label: z.string().trim().min(1).max(60) }))
    .min(1)
    .max(4),
});

export const guruActionSchema = z.discriminatedUnion("type", [
  tripInquiryActionSchema,
  whatsappActionSchema,
  linksActionSchema,
]);

export type GuruAction = z.infer<typeof guruActionSchema>;
export type TripInquiryAction = z.infer<typeof tripInquiryActionSchema>;

export type GuruResponse = {
  reply: string;
  actions: GuruAction[];
  followups: string[];
};
