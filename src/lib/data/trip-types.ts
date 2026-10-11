import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import type { PackageCard } from "@/lib/data/packages";

export type TripTypeCard = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  order: number;
};

export type TripTypeDetail = TripTypeCard & { updatedAt: Date };

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  icon: true,
  color: true,
  description: true,
  coverImage: true,
  coverImageAlt: true,
  order: true,
} as const;

export async function getPublishedTripTypes(): Promise<TripTypeCard[]> {
  return safeQuery(
    "tripTypes.list",
    () =>
      prisma.tripType.findMany({
        where: { published: true },
        select: cardSelect,
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    [],
  );
}

export async function getTripTypeBySlug(slug: string): Promise<TripTypeDetail | null> {
  if (!slug) return null;
  return safeQuery(
    `tripTypes.slug:${slug}`,
    () =>
      prisma.tripType.findFirst({
        where: { slug, published: true },
        select: { ...cardSelect, updatedAt: true },
      }),
    null,
  );
}

/**
 * Published packages whose `Package.tripType` matches this trip type.
 * `tripType` is stored as free text by the admin — match the slug and the
 * display name (MySQL's default case-insensitive collation covers casing).
 */
export async function getPackagesByTripTypeSlug(
  slug: string,
  name?: string | null,
  limit = 12,
): Promise<PackageCard[]> {
  if (!slug) return [];
  const candidates = Array.from(
    new Set([slug, name?.trim()].filter((value): value is string => Boolean(value))),
  );
  return safeQuery(
    `tripTypes.packages:${slug}`,
    () =>
      prisma.package.findMany({
        where: { published: true, tripType: { in: candidates } },
        select: {
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
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit,
      }),
    [],
  );
}
