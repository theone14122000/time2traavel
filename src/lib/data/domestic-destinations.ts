import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import {
  DOMESTIC_DESTINATIONS,
  getStaticDestination,
  type DomesticDestination,
} from "@/lib/domestic-destinations";

export type DomesticDestinationView = DomesticDestination & {
  dbId: string | null;
  cover: string;
};

export async function getDomesticDestinations(): Promise<DomesticDestinationView[]> {
  const dbRows = await safeQuery(
    "domesticDestinations.list",
    () =>
      prisma.destination.findMany({
        where: { published: true, slug: { in: DOMESTIC_DESTINATIONS.map((d) => d.slug) } },
        select: {
          id: true,
          slug: true,
          name: true,
          summary: true,
          description: true,
          bestTimeToVisit: true,
        },
      }),
    [],
  );

  const bySlug = new Map(dbRows.map((row) => [row.slug, row]));

  return DOMESTIC_DESTINATIONS.map((staticDest) => {
    const row = bySlug.get(staticDest.slug);
    if (!row) {
      return { ...staticDest, dbId: null, cover: coverOf(staticDest) };
    }
    return {
      ...staticDest,
      dbId: row.id,
      name: row.name?.trim() || staticDest.name,
      tagline: row.summary?.trim() || staticDest.tagline,
      overview: row.description?.trim() || staticDest.overview,
      bestTime: row.bestTimeToVisit?.trim() || staticDest.bestTime,
      cover: coverOf(staticDest),
    };
  });
}

export async function getDomesticDestinationBySlug(
  slug: string,
): Promise<DomesticDestinationView | null> {
  const all = await getDomesticDestinations();
  return all.find((d) => d.slug === slug) ?? null;
}

function coverOf(destination: DomesticDestination): string {
  const index = Math.min(destination.coverIndex, destination.images.length - 1);
  return destination.images[index >= 0 ? index : 0] ?? destination.images[0] ?? "";
}

export { getStaticDestination };
