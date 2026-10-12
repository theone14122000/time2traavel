import Link from "next/link";
import { PackageGrid } from "@/components/home/package-grid";
import type { HomePackageMeta } from "@/components/home/package-card";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getPackages } from "@/lib/data/packages";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { toStringArray } from "@/lib/utils";

type PackageMetaRow = {
  id: string;
  createdAt: Date;
  highlights: unknown;
};

/**
 * Home packages strip — dynamic, with a brutalist empty state when the admin
 * has not published any packages yet. `createdAt`/`highlights` are fetched
 * for the DB-flagged stickers and the highlights count preview.
 */
export async function PackagesSection() {
  const { items } = await getPackages({ sort: "popular", page: 1, pageSize: 6 });

  const metaRows = await safeQuery<PackageMetaRow[]>(
    "home.packages.meta",
    () =>
      items.length === 0
        ? Promise.resolve([])
        : prisma.package.findMany({
            where: { id: { in: items.map((item) => item.id) } },
            select: { id: true, createdAt: true, highlights: true },
          }),
    [],
  );

  const metaById = new Map<string, HomePackageMeta>(
    metaRows.map((row) => [
      row.id,
      {
        createdAt: row.createdAt.toISOString(),
        highlightsCount: toStringArray(row.highlights).length,
      },
    ]),
  );

  const packages = items.map((pkg) => ({ pkg, meta: metaById.get(pkg.id) }));

  return (
    <section
      id="packages"
      aria-labelledby="packages-heading"
      className="relative w-full border-y-[3px] border-ink bg-paper"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="packages-heading"
            eyebrow="Packages"
            title="Good trips. great stories."
            description="Find a journey that matches your travel style and turns your next holiday into something unforgettable."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/packages">
              All packages
              <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              eyebrow="Packages"
              title="Packages coming soon"
              description="We haven't published any packages yet. Tell us your dates and we'll put together a plan for you."
              tone="mint"
              illustration="luggage"
              action={
                <Button asChild variant="default" size="md">
                  <Link href="/about-us#contact">Enquire now</Link>
                </Button>
              }
            />
          ) : (
            <PackageGrid packages={packages} />
          )}
        </div>
      </div>
    </section>
  );
}
