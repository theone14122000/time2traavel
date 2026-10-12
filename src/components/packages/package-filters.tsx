"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PackageSort } from "@/lib/data/packages";

export const PACKAGE_SORT_OPTIONS: { value: PackageSort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration-asc", label: "Duration: short to long" },
  { value: "duration-desc", label: "Duration: long to short" },
];

export type PackageFilterState = {
  search: string;
  destination: string;
  minDuration: string;
  maxDuration: string;
  minPrice: string;
  maxPrice: string;
};

const emptyFilters: PackageFilterState = {
  search: "",
  destination: "",
  minDuration: "",
  maxDuration: "",
  minPrice: "",
  maxPrice: "",
};

function isPositiveInt(value: string): boolean {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 && String(n) === value.trim();
}

function buildQuery(filters: PackageFilterState, sort: PackageSort): string {
  const params = new URLSearchParams();
  const search = filters.search.trim();
  if (search) params.set("q", search);
  if (filters.destination) params.set("destination", filters.destination);
  if (isPositiveInt(filters.minDuration)) params.set("minDays", filters.minDuration.trim());
  if (isPositiveInt(filters.maxDuration)) params.set("maxDays", filters.maxDuration.trim());
  if (isPositiveInt(filters.minPrice)) params.set("minPrice", filters.minPrice.trim());
  if (isPositiveInt(filters.maxPrice)) params.set("maxPrice", filters.maxPrice.trim());
  if (sort !== "popular") params.set("sort", sort);
  return params.toString();
}

/**
 * URL-driven package filters. Every change navigates (via router.replace)
 * so the server page can re-query the database with the real search params.
 */
export function PackageFilters({
  initial,
  destinationOptions,
}: {
  initial: PackageFilterState & { sort: PackageSort };
  destinationOptions: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const ids = React.useId();
  const [filters, setFilters] = React.useState<PackageFilterState>({
    search: initial.search,
    destination: initial.destination,
    minDuration: initial.minDuration,
    maxDuration: initial.maxDuration,
    minPrice: initial.minPrice,
    maxPrice: initial.maxPrice,
  });
  const [sort, setSort] = React.useState<PackageSort>(initial.sort);

  const navigate = React.useCallback(
    (next: PackageFilterState, nextSort: PackageSort) => {
      const qs = buildQuery(next, nextSort);
      router.replace(qs ? `/packages?${qs}` : "/packages", { scroll: false });
    },
    [router],
  );

  const update = (patch: Partial<PackageFilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    navigate(next, sort);
  };

  const debouncedSearch = filters.search.trim();
  React.useEffect(() => {
    if (debouncedSearch === initial.search.trim()) return;
    const handle = window.setTimeout(() => navigate(filters, sort), 400);
    return () => window.clearTimeout(handle);
  }, [debouncedSearch, filters, sort, initial.search, navigate]);

  const clearFilters = () => {
    setFilters(emptyFilters);
    setSort("popular");
    router.replace("/packages", { scroll: false });
  };

  const activeCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.destination ? 1 : 0) +
    (filters.minDuration.trim() ? 1 : 0) +
    (filters.maxDuration.trim() ? 1 : 0) +
    (filters.minPrice.trim() ? 1 : 0) +
    (filters.maxPrice.trim() ? 1 : 0) +
    (sort !== "popular" ? 1 : 0);

  return (
    <section
      aria-label="Filter packages"
      className="border-4 border-ink bg-paper p-4 shadow-brutal-md sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink pb-3">
        <h3 className="flex items-center gap-2 font-display text-h4 uppercase">
          <SlidersHorizontal aria-hidden="true" className="size-5" />
          Filters
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="tap-44"
              onClick={clearFilters}
            >
              <X aria-hidden="true" className="size-4" />
              Clear filters ({activeCount})
            </Button>
          ) : (
            <p className="label-brutal text-ink-soft">Filter the live catalogue</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-1">
          <Label htmlFor={`${ids}-search`}>Search</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            />
            <Input
              id={`${ids}-search`}
              type="search"
              placeholder="Title, destination or keyword"
              autoComplete="off"
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`${ids}-destination`}>Destination</Label>
          <Select
            value={filters.destination || "all"}
            onValueChange={(value) => update({ destination: value === "all" ? "" : value })}
          >
            <SelectTrigger id={`${ids}-destination`} aria-label="Filter by destination">
              <SelectValue placeholder="All destinations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All destinations</SelectItem>
              {destinationOptions.map((option) => (
                <SelectItem key={option.slug} value={option.slug}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`${ids}-sort`}>Sort by</Label>
          <Select
            value={sort}
            onValueChange={(value) => {
              const next = value as PackageSort;
              setSort(next);
              navigate(filters, next);
            }}
          >
            <SelectTrigger id={`${ids}-sort`} aria-label="Sort packages">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <Label htmlFor={`${ids}-min-days`}>Min days</Label>
          <Input
            id={`${ids}-min-days`}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="e.g. 3"
            value={filters.minDuration}
            onChange={(e) => setFilters((f) => ({ ...f, minDuration: e.target.value }))}
            onBlur={() => navigate(filters, sort)}
          />
        </div>
        <div>
          <Label htmlFor={`${ids}-max-days`}>Max days</Label>
          <Input
            id={`${ids}-max-days`}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="e.g. 10"
            value={filters.maxDuration}
            onChange={(e) => setFilters((f) => ({ ...f, maxDuration: e.target.value }))}
            onBlur={() => navigate(filters, sort)}
          />
        </div>
        <div>
          <Label htmlFor={`${ids}-min-price`}>Min price (₹)</Label>
          <Input
            id={`${ids}-min-price`}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="e.g. 5000"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            onBlur={() => navigate(filters, sort)}
          />
        </div>
        <div>
          <Label htmlFor={`${ids}-max-price`}>Max price (₹)</Label>
          <Input
            id={`${ids}-max-price`}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="e.g. 50000"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            onBlur={() => navigate(filters, sort)}
          />
        </div>
      </div>
    </section>
  );
}
