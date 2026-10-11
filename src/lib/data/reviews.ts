import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type ApprovedReview = {
  id: string;
  name: string;
  context: string | null;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export async function getApprovedReviews(limit = 12): Promise<ApprovedReview[]> {
  return safeQuery(
    "reviews.approved",
    () =>
      prisma.review.findMany({
        where: { status: "APPROVED" },
        select: { id: true, name: true, context: true, rating: true, comment: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    [],
  );
}

export async function getPublishedFaqs(): Promise<FaqItem[]> {
  return safeQuery(
    "faqs.published",
    () =>
      prisma.faq.findMany({
        where: { published: true },
        select: { id: true, question: true, answer: true, category: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    [],
  );
}
