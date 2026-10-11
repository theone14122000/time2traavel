import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type GuideCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  readingMinutes: number | null;
  createdAt: Date;
};

export type GuideDetail = GuideCard & {
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  category: true,
  coverImage: true,
  coverImageAlt: true,
  readingMinutes: true,
  createdAt: true,
} as const;

const WORDS_PER_MINUTE = 200;

/** Fallback reading time when `readingMinutes` is not set in the admin. */
export function estimateReadingMinutes(body: string | null | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export async function getPublishedGuides(options?: {
  category?: string;
  limit?: number;
}): Promise<GuideCard[]> {
  const { category, limit } = options ?? {};
  return safeQuery(
    "guides.list",
    () =>
      prisma.guidePost.findMany({
        where: {
          published: true,
          ...(category?.trim() ? { category: category.trim() } : {}),
        },
        select: cardSelect,
        orderBy: [{ createdAt: "desc" }, { title: "asc" }],
        ...(limit ? { take: limit } : {}),
      }),
    [],
  );
}

export async function getLatestGuides(limit = 3): Promise<GuideCard[]> {
  return getPublishedGuides({ limit });
}

export async function getGuideBySlug(slug: string): Promise<GuideDetail | null> {
  if (!slug) return null;
  return safeQuery(
    `guides.slug:${slug}`,
    () =>
      prisma.guidePost.findFirst({
        where: { slug, published: true },
        select: { ...cardSelect, body: true, seoTitle: true, seoDescription: true, updatedAt: true },
      }),
    null,
  );
}

/** Distinct published categories, sorted — used for the filter links. */
export async function getGuideCategories(): Promise<string[]> {
  const rows = await safeQuery(
    "guides.categories",
    () =>
      prisma.guidePost.findMany({
        where: { published: true },
        select: { category: true },
        distinct: ["category"],
      }),
    [],
  );
  const values = new Set<string>();
  for (const row of rows) {
    const value = row.category?.trim();
    if (value) values.add(value);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

/** Related guides in the same category (excluding the current guide). */
export async function getRelatedGuides(
  category: string,
  excludeSlug: string,
  limit = 3,
): Promise<GuideCard[]> {
  const value = category?.trim();
  if (!value) return [];
  return safeQuery(
    `guides.related:${value}`,
    () =>
      prisma.guidePost.findMany({
        where: { published: true, category: value, slug: { not: excludeSlug } },
        select: cardSelect,
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      }),
    [],
  );
}
