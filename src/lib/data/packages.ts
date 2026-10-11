import "server-only";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";
import { safeQuery } from "@/lib/data/safe";

export type PackageCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  durationDays: number;
  durationLabel: string | null;
  price: number | null;
  currency: string;
  priceNote: string | null;
  image: string | null;
  imageAlt: string | null;
  featured: boolean;
  order: number;
  destination: { slug: string; name: string; state: string } | null;
};

export type PackageDetail = PackageCard & {
  description: string | null;
  highlights: unknown;
  inclusions: unknown;
  exclusions: unknown;
  gallery: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  itinerary: { day: number; title: string; description: string }[];
};

const cardSelect = {
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
} as const;

export type PackageSort = "popular" | "price-asc" | "price-desc" | "duration-asc" | "duration-desc";

export type PackageFilters = {
  destination?: string;
  minDuration?: number;
  maxDuration?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};

function whereFromFilters(filters: PackageFilters) {
  const where: Record<string, unknown> = { published: true };

  if (filters.destination) {
    where.destination = { slug: filters.destination };
  }
  if (filters.minDuration || filters.maxDuration) {
    where.durationDays = {
      ...(filters.minDuration ? { gte: filters.minDuration } : {}),
      ...(filters.maxDuration ? { lte: filters.maxDuration } : {}),
    };
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { title: { contains: term } },
      { summary: { contains: term } },
      { destination: { name: { contains: term } } },
    ];
  }
  return where;
}

function orderByFromSort(sort: PackageSort) {
  switch (sort) {
    case "price-asc":
      return [{ price: { sort: "asc", nulls: "last" } }, { order: "asc" }] as const;
    case "price-desc":
      return [{ price: { sort: "desc", nulls: "last" } }, { order: "asc" }] as const;
    case "duration-asc":
      return [{ durationDays: "asc" }, { order: "asc" }] as const;
    case "duration-desc":
      return [{ durationDays: "desc" }, { order: "asc" }] as const;
    default:
      return [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }] as const;
  }
}

export async function getPackages(options?: {
  filters?: PackageFilters;
  sort?: PackageSort;
  page?: number;
  pageSize?: number;
}): Promise<{ items: PackageCard[]; total: number; page: number; pageSize: number }> {
  const filters = options?.filters ?? {};
  const sort = options?.sort ?? "popular";
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const page = Math.max(options?.page ?? 1, 1);
  const where = whereFromFilters(filters);

  const [items, total] = await Promise.all([
    safeQuery(
      "packages.list",
      () =>
        prisma.package.findMany({
          where,
          select: cardSelect,
          orderBy: orderByFromSort(sort) as never,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      [],
    ),
    safeQuery("packages.count", () => prisma.package.count({ where }), 0),
  ]);

  return { items, total, page, pageSize };
}

export async function getFeaturedPackages(limit = 3): Promise<PackageCard[]> {
  const { items } = await getPackages({ sort: "popular", page: 1, pageSize: limit });
  return items;
}

export async function getPackageBySlug(slug: string): Promise<PackageDetail | null> {
  if (!slug) return null;
  return safeQuery(
    `packages.slug:${slug}`,
    () =>
      prisma.package.findFirst({
        where: { slug, published: true },
        select: {
          ...cardSelect,
          description: true,
          highlights: true,
          inclusions: true,
          exclusions: true,
          gallery: true,
          seoTitle: true,
          seoDescription: true,
          updatedAt: true,
          itinerary: { orderBy: { day: "asc" }, select: { day: true, title: true, description: true } },
        },
      }),
    null,
  );
}

export async function getPackagesByDestination(
  destinationId: string,
  limit = 4,
): Promise<PackageCard[]> {
  if (!destinationId) return [];
  return safeQuery(
    "packages.byDestination",
    () =>
      prisma.package.findMany({
        where: { published: true, destinationId },
        select: cardSelect,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: limit,
      }),
    [],
  );
}

/** Aggregated filter options derived from real published data. */
export async function getPackageFilterOptions(): Promise<{
  destinations: { slug: string; name: string }[];
  durations: { min: number; max: number } | null;
  prices: { min: number; max: number } | null;
  total: number;
}> {
  const [destinations, agg, total] = await Promise.all([
    safeQuery(
      "packages.filterDestinations",
      () =>
        prisma.destination.findMany({
          where: { packages: { some: { published: true } } },
          select: { slug: true, name: true },
          orderBy: { name: "asc" },
        }),
      [],
    ),
    safeQuery(
      "packages.filterAgg",
      () =>
        prisma.package.aggregate({
          where: { published: true },
          _min: { durationDays: true, price: true },
          _max: { durationDays: true, price: true },
        }),
      null,
    ),
    safeQuery("packages.filterCount", () => prisma.package.count({ where: { published: true } }), 0),
  ]);

  return {
    destinations,
    durations:
      agg?._min.durationDays != null && agg._max.durationDays != null
        ? { min: agg._min.durationDays, max: agg._max.durationDays }
        : null,
    prices:
      agg?._min.price != null && agg._max.price != null
        ? { min: agg._min.price, max: agg._max.price }
        : null,
    total,
  };
}
