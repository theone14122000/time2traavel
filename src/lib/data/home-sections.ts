import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type HomeSectionRow = {
  key: string;
  enabled: boolean;
  order: number;
  config: unknown;
};

/**
 * Built-in home layout used until the admin saves real `HomeSection` rows.
 * Keys match the seed defaults so toggles made in the admin take over
 * one-by-one without a deploy.
 */
export const DEFAULT_HOME_SECTIONS: HomeSectionRow[] = [
  { key: "announcement", enabled: true, order: 0, config: null },
  { key: "hero", enabled: true, order: 1, config: null },
  { key: "marquee", enabled: true, order: 2, config: null },
  { key: "domestic", enabled: true, order: 3, config: null },
  { key: "international", enabled: true, order: 4, config: null },
  { key: "featured_packages", enabled: true, order: 5, config: null },
  { key: "services", enabled: true, order: 6, config: null },
  { key: "how_it_works", enabled: true, order: 7, config: null },
  { key: "trip_types", enabled: true, order: 8, config: null },
  { key: "destination_finder", enabled: true, order: 9, config: null },
  { key: "gallery", enabled: true, order: 10, config: null },
  { key: "reviews", enabled: true, order: 11, config: null },
  { key: "guides", enabled: true, order: 12, config: null },
  { key: "founder", enabled: true, order: 13, config: null },
  { key: "faq", enabled: true, order: 14, config: null },
  { key: "final_cta", enabled: true, order: 15, config: null },
];

/**
 * Ordered home-section layout from the database.
 * Falls back to the built-in defaults when the table is empty or the
 * database is unreachable, so the home page always has a layout.
 */
export async function getHomeSections(): Promise<HomeSectionRow[]> {
  const rows = await safeQuery(
    "homeSections.list",
    () =>
      prisma.homeSection.findMany({
        select: { key: true, enabled: true, order: true, config: true },
        orderBy: [{ order: "asc" }, { key: "asc" }],
      }),
    [],
  );

  if (rows.length === 0) {
    return DEFAULT_HOME_SECTIONS.map((section) => ({ ...section }));
  }

  return rows.map((row) => ({
    key: row.key,
    enabled: row.enabled,
    order: row.order,
    config: row.config ?? null,
  }));
}
