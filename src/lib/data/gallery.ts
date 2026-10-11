import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  category: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  order: number;
  destination: { slug: string; name: string } | null;
};

const itemSelect = {
  id: true,
  url: true,
  alt: true,
  category: true,
  caption: true,
  width: true,
  height: true,
  order: true,
  destination: { select: { slug: true, name: true } },
} as const;

export async function getGalleryItems(options?: {
  category?: string;
  limit?: number;
}): Promise<GalleryItem[]> {
  const { category, limit } = options ?? {};
  return safeQuery(
    "gallery.list",
    () =>
      prisma.galleryItem.findMany({
        where: category?.trim() ? { category: category.trim() } : {},
        select: itemSelect,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        ...(limit ? { take: limit } : {}),
      }),
    [],
  );
}

/** Distinct gallery categories, sorted — used for the filter chips. */
export async function getGalleryCategories(): Promise<string[]> {
  const rows = await safeQuery(
    "gallery.categories",
    () =>
      prisma.galleryItem.findMany({
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
