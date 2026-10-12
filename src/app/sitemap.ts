import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { getPackages } from "@/lib/data/packages";

const STATIC_PATHS: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/packages", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about-us", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
];

/**
 * Fail-safe sitemap: data accessors return empty arrays when the database is
 * unavailable, so the build never breaks on missing content.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [destinations, packageResult] = await Promise.all([
    getPublishedDestinations(),
    getPackages({ page: 1, pageSize: 1000 }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const destinationEntries: MetadataRoute.Sitemap = destinations.map((destination) => ({
    url: absoluteUrl(`/destinations/${destination.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const packageEntries: MetadataRoute.Sitemap = packageResult.items.map((pkg) => ({
    url: absoluteUrl(`/packages/${pkg.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...destinationEntries, ...packageEntries];
}
