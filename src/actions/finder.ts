"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toStringArray } from "@/lib/utils";
import { FINDER_BUDGET_BANDS, FINDER_MONTHS } from "@/components/home/finder-options";

const MONTH_FULL_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const finderInputSchema = z.object({
  month: z.enum(FINDER_MONTHS).optional(),
  tripType: z.string().trim().max(80).optional(),
  budgetBand: z.enum(FINDER_BUDGET_BANDS).optional(),
});

export type FinderDestinationMatch = {
  slug: string;
  name: string;
  state: string;
  image: string | null;
  summary: string | null;
};

export type FinderPackageMatch = {
  slug: string;
  title: string;
  image: string | null;
  destinationName: string | null;
  durationDays: number;
  price: number | null;
  currency: string;
  tripType: string | null;
};

export type FinderResult =
  | { ok: true; destinations: FinderDestinationMatch[]; packages: FinderPackageMatch[] }
  | { ok: false; error: string };

function monthFromEntry(entry: unknown): number | null {
  if (typeof entry === "number" && Number.isInteger(entry) && entry >= 1 && entry <= 12) {
    return entry;
  }
  if (typeof entry !== "string") return null;
  const value = entry.trim().toLowerCase();
  if (!value) return null;
  if (/^\d{1,2}$/.test(value)) {
    const numeric = Number(value);
    return numeric >= 1 && numeric <= 12 ? numeric : null;
  }
  const shortIndex = FINDER_MONTHS.findIndex(
    (month) => month.toLowerCase() === value.slice(0, 3),
  );
  if (shortIndex >= 0) return shortIndex + 1;
  const fullIndex = MONTH_FULL_NAMES.findIndex((month) => month === value);
  return fullIndex >= 0 ? fullIndex + 1 : null;
}

function monthFilterMatches(
  monthIndex: number | null,
  packageMonths: unknown,
  destinationMonths: unknown,
): boolean {
  if (monthIndex === null) return true;
  const entries = [
    ...toStringArray(packageMonths),
    ...toStringArray(destinationMonths),
  ];
  const indexes = entries
    .map(monthFromEntry)
    .filter((value): value is number => value !== null);
  if (indexes.length === 0) return true;
  return indexes.includes(monthIndex);
}

export async function findMatchesAction(input: unknown): Promise<FinderResult> {
  const parsed = finderInputSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check your filters and try again.",
    };
  }

  const { month, tripType, budgetBand } = parsed.data;
  const monthIndex = month ? FINDER_MONTHS.indexOf(month) + 1 : null;
  const tripTypeValue = tripType?.trim() || null;

  try {
    let tripTypeValues: string[] | null = null;
    if (tripTypeValue) {
      const tripTypeRow = await prisma.tripType.findFirst({
        where: { OR: [{ slug: tripTypeValue }, { name: tripTypeValue }] },
        select: { slug: true, name: true },
      });
      tripTypeValues = Array.from(
        new Set(
          [tripTypeValue, tripTypeRow?.slug, tripTypeRow?.name].filter(
            (value): value is string => typeof value === "string" && value.length > 0,
          ),
        ),
      );
    }

    const [packageRows, destinationRows] = await Promise.all([
      prisma.package.findMany({
        where: {
          published: true,
          ...(tripTypeValues ? { tripType: { in: tripTypeValues } } : {}),
          ...(budgetBand ? { budgetBand } : {}),
        },
        select: {
          slug: true,
          title: true,
          image: true,
          durationDays: true,
          price: true,
          currency: true,
          tripType: true,
          bestMonths: true,
          destination: { select: { name: true, bestMonths: true } },
        },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        take: 120,
      }),
      prisma.destination.findMany({
        where: { published: true },
        select: {
          slug: true,
          name: true,
          state: true,
          summary: true,
          image: true,
          bestMonths: true,
          order: true,
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        take: 120,
      }),
    ]);

    const packages: FinderPackageMatch[] = packageRows
      .filter((row) =>
        monthFilterMatches(monthIndex, row.bestMonths, row.destination?.bestMonths),
      )
      .slice(0, 8)
      .map((row) => ({
        slug: row.slug,
        title: row.title,
        image: row.image,
        destinationName: row.destination?.name ?? null,
        durationDays: row.durationDays,
        price: row.price,
        currency: row.currency,
        tripType: row.tripType,
      }));

    const destinations: FinderDestinationMatch[] = destinationRows
      .filter((row) => monthFilterMatches(monthIndex, row.bestMonths, null))
      .slice(0, 8)
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        state: row.state,
        image: row.image,
        summary: row.summary,
      }));

    return { ok: true, destinations, packages };
  } catch (error) {
    console.error(
      "[finder] match query failed:",
      error instanceof Error ? error.message : error,
    );
    return { ok: true, destinations: [], packages: [] };
  }
}
