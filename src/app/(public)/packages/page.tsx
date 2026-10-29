import type { Metadata } from "next";
import Link from "next/link";
import { Compass, PackageSearch, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { buttonVariants } from "@/components/ui/button-variants";
import { PackageFilters, type PackageFilterState } from "@/components/packages/package-filters";
import { PackageGrid } from "@/components/packages/package-grid";
import { PackagePagination } from "@/components/packages/package-pagination";
import { CompareProvider, COMPARE_LIMIT } from "@/components/packages/compare-context";
import { CompareTray } from "@/components/packages/compare-tray";
import { getPackages, getPackageFilterOptions, type PackageFilters as FiltersInput, type PackageSort } from "@/lib/data/packages";
import { PAGE_SIZE } from "@/lib/constants";
import { pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Travel Packages",
    description:
      "Browse published Time to Travel packages — filter by destination, duration and price, sort the list, and enquire for custom dates.",
    path: "/packages",
  });
}

const SORTS: PackageSort[] = ["popular", "price-asc", "price-desc", "duration-asc", "duration-desc"];

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function positiveInt(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseSort(value: string | string[] | undefined): PackageSort {
  const raw = first(value);
  return (SORTS as string[]).includes(raw) ? (raw as PackageSort) : "popular";
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PackagesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const search = first(sp.q);
  const destination = first(sp.destination);
  const minDuration = positiveInt(sp.minDays);
  const maxDuration = positiveInt(sp.maxDays);
  const minPrice = positiveInt(sp.minPrice);
  const maxPrice = positiveInt(sp.maxPrice);
  const sort = parseSort(sp.sort);
  const page = positiveInt(sp.page) ?? 1;

  const filters: FiltersInput = {
    ...(search ? { search } : {}),
    ...(destination ? { destination } : {}),
    ...(minDuration ? { minDuration } : {}),
    ...(maxDuration ? { maxDuration } : {}),
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
  };

  const [result, options] = await Promise.all([
    getPackages({ filters, sort, page, pageSize: PAGE_SIZE }),
    getPackageFilterOptions(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const currentPage = Math.min(result.page, totalPages);

  const canonicalQuery = new URLSearchParams();
  if (search) canonicalQuery.set("q", search);
  if (destination) canonicalQuery.set("destination", destination);
  if (minDuration) canonicalQuery.set("minDays", String(minDuration));
  if (maxDuration) canonicalQuery.set("maxDays", String(maxDuration));
  if (minPrice) canonicalQuery.set("minPrice", String(minPrice));
  if (maxPrice) canonicalQuery.set("maxPrice", String(maxPrice));
  if (sort !== "popular") canonicalQuery.set("sort", sort);

  const hasActiveFilters = canonicalQuery.size > 0 || page > 1;

  const filterInitial: PackageFilterState & { sort: PackageSort } = {
    search,
    destination,
    minDuration: minDuration != null ? String(minDuration) : "",
    maxDuration: maxDuration != null ? String(maxDuration) : "",
    minPrice: minPrice != null ? String(minPrice) : "",
    maxPrice: maxPrice != null ? String(maxPrice) : "",
    sort,
  };

  const rangeStart = result.total === 0 ? 0 : (currentPage - 1) * result.pageSize + 1;
  const rangeEnd = result.total === 0 ? 0 : rangeStart + result.items.length - 1;
  const resultSummary =
    result.total === 0
      ? "No packages match"
      : `Showing ${rangeStart}–${rangeEnd} of ${pluralize(result.total, "package")}`;

  return (
    <CompareProvider>
      <PageHeader
        eyebrow="Packages"
        title="Find your next trip"
        description="Every package below is pulled live from our catalogue. Filter by destination, duration and budget — enquire for custom dates on any of them."
        tone="butter"
      >
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/destinations">
          <Compass aria-hidden="true" className="size-4" />
          Browse destinations
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/about-us#contact">
          Contact us
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="packages-list-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="packages-list-heading"
          eyebrow="Catalogue"
          title="All packages"
          description="Use the filters to narrow the list — results update as you type or pick."
        />

        <div className="mt-8 grid grid-cols-1 gap-8">
          <PackageFilters initial={filterInitial} destinationOptions={options.destinations} />

          {result.items.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                eyebrow="No results"
                title="No packages match these filters"
                description="Try widening the duration or price range, or clear the filters to see everything we've published."
                tone="sky"
                icon={<PackageSearch className="size-8" aria-hidden="true" />}
                action={
                  <Link
                    className={buttonVariants({ variant: "default", size: "md" })}
                    href="/packages"
                  >
                    Clear filters
                  </Link>
                }
              />
            ) : (
              <EmptyState
                eyebrow="Packages"
                title="Packages coming soon"
                description="We're still loading packages onto the site. Tell us your destination, dates and group size — we'll plan it with you in the meantime."
                tone="butter"
                icon={<Compass className="size-8" aria-hidden="true" />}
                action={
                  <Link
                    className={buttonVariants({ variant: "default", size: "md" })}
                    href="/about-us#contact"
                  >
                    <Send aria-hidden="true" className="size-4" />
                    Enquire now
                  </Link>
                }
              />
            )
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-butter px-4 py-3 shadow-brutal-sm">
                <p role="status" aria-live="polite" className="label-brutal">
                  {resultSummary}
                </p>
                <p className="label-brutal text-ink-soft">
                  Tick Compare on up to {COMPARE_LIMIT} packages
                </p>
              </div>

              <PackageGrid packages={result.items} />
              <PackagePagination
                page={currentPage}
                totalPages={totalPages}
                query={canonicalQuery.toString()}
              />
            </>
          )}
        </div>
      </SectionWrapper>

      <CompareTray />

      <section
        id="packages-cta"
        aria-labelledby="packages-cta-heading"
        className="relative w-full border-b border-line bg-mint"
      >
        <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="label-brutal inline-flex w-fit items-center gap-2 border border-line bg-lemon px-3 py-2">
                  Need something custom?
                </span>
                <h2
                  id="packages-cta-heading"
                  className="mt-5 max-w-[16ch] text-h2"
                >
                  We build trips around your dates
                </h2>
                <p className="mt-4 max-w-xl text-lead font-medium text-ink-soft">
                  None of these quite right? Send us your destination, travel window and
                  group size — we&apos;ll put together a plan that fits.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  className={buttonVariants({ variant: "default", size: "xl" })}
                  href="/about-us#contact"
                >
                  <Send aria-hidden="true" className="size-4" />
                  Plan a custom trip
                </Link>
                <Link
                  className={buttonVariants({ variant: "outline", size: "xl" })}
                  href="/destinations"
                >
                  View destinations
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </CompareProvider>
  );
}
