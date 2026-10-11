import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type DestinationCard = {
  id: string;
  slug: string;
  name: string;
  state: string;
  region: string | null;
  summary: string | null;
  image: string | null;
  imageAlt: string | null;
  featured: boolean;
  order: number;
};

export type DestinationDetail = DestinationCard & {
  description: string | null;
  bestTimeToVisit: string | null;
  gallery: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

const cardSelect = {
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

export async function getPublishedDestinations(options?: {
  limit?: number;
  featuredOnly?: boolean;
}): Promise<DestinationCard[]> {
  const { limit, featuredOnly } = options ?? {};
  return safeQuery(
    "destinations.list",
    () =>
      prisma.destination.findMany({
        where: { published: true, ...(featuredOnly ? { featured: true } : {}) },
        select: cardSelect,
        orderBy: [{ order: "asc" }, { name: "asc" }],
        ...(limit ? { take: limit } : {}),
      }),
    [],
  );
}

export async function getDestinationBySlug(
  slug: string,
): Promise<DestinationDetail | null> {
  if (!slug) return null;
  return safeQuery(
    `destinations.slug:${slug}`,
    () =>
      prisma.destination.findFirst({
        where: { slug, published: true },
        select: { ...cardSelect, description: true, bestTimeToVisit: true, gallery: true, seoTitle: true, seoDescription: true, updatedAt: true },
      }),
    null,
  );
}

export async function getDestinationFilters(): Promise<string[]> {
  const rows = await safeQuery(
    "destinations.filters",
    () =>
      prisma.destination.findMany({
        where: { published: true },
        select: { state: true, region: true },
        distinct: ["state"],
      }),
    [],
  );
  const values = new Set<string>();
  for (const row of rows) {
    if (row.state) values.add(row.state);
    if (row.region) values.add(row.region);
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export async function countPublishedDestinations(): Promise<number> {
  return safeQuery(
    "destinations.count",
    () => prisma.destination.count({ where: { published: true } }),
    0,
  );
}
