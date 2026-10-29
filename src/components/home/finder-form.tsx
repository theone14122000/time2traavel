"use client";

import * as React from "react";
import Link from "next/link";
import { Clock3, Compass, MapPin, Search, Wallet } from "lucide-react";
import {
  findMatchesAction,
  type FinderDestinationMatch,
  type FinderPackageMatch,
} from "@/actions/finder";
import {
  FINDER_BUDGET_BANDS,
  FINDER_MONTHS,
} from "@/components/home/finder-options";
import { EmptyState } from "@/components/shared/empty-state";
import { TagChip } from "@/components/ui/badge";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { RadioCards } from "@/components/ui/radio-cards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, pluralize } from "@/lib/utils";

type TripTypeOption = { slug: string; name: string };

type FinderState = {
  status: "idle" | "loading" | "done" | "error";
  destinations: FinderDestinationMatch[];
  packages: FinderPackageMatch[];
  error: string | null;
};

const IDLE_STATE: FinderState = {
  status: "idle",
  destinations: [],
  packages: [],
  error: null,
};

const MONTH_ANY = "any";

const BUDGET_OPTIONS = [
  { value: "", label: "Any band", description: "No budget filter" },
  ...FINDER_BUDGET_BANDS.map((band) => ({
    value: band,
    label: band,
    description: `Packages tagged “${band}”`,
  })),
];

/**
 * Client half of the destination finder: month + trip type + budget band
 * filters that call `findMatchesAction` and render compact result cards.
 */
export function FinderForm({ tripTypes }: { tripTypes: TripTypeOption[] }) {
  const [month, setMonth] = React.useState<string>(MONTH_ANY);
  const [tripType, setTripType] = React.useState<string>("");
  const [budgetBand, setBudgetBand] = React.useState<string>("");
  const [state, setState] = React.useState<FinderState>(IDLE_STATE);

  const hasResults =
    state.destinations.length > 0 || state.packages.length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    try {
      const result = await findMatchesAction({
        month: month === MONTH_ANY ? undefined : month,
        tripType: tripType || undefined,
        budgetBand: budgetBand || undefined,
      });

      if (!result.ok) {
        setState({
          status: "error",
          destinations: [],
          packages: [],
          error: result.error,
        });
        return;
      }

      setState({
        status: "done",
        destinations: result.destinations,
        packages: result.packages,
        error: null,
      });
    } catch {
      setState({
        status: "error",
        destinations: [],
        packages: [],
        error: "We couldn't run the search right now — please try again.",
      });
    }
  }

  return (
    <div className="border border-line bg-paper p-4 shadow-brutal-md sm:p-6">
      <form onSubmit={handleSubmit} className="grid gap-5" aria-label="Trip finder">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="label-brutal flex items-center gap-1.5">
              <Compass aria-hidden="true" className="size-3.5" />
              Travel month
            </span>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger name="finder-month" aria-label="Travel month">
                <SelectValue placeholder="Any month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MONTH_ANY}>Any month</SelectItem>
                {FINDER_MONTHS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="grid gap-1.5 sm:col-span-2">
            <span className="label-brutal flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" />
              Trip type
            </span>
            <div
              role="group"
              aria-label="Trip type"
              className="no-scrollbar snap-rail flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0"
            >
              <TagChip active={tripType === ""} onClick={() => setTripType("")}>
                Any
              </TagChip>
              {tripTypes.map((option) => (
                <TagChip
                  key={option.slug}
                  active={tripType === option.slug}
                  onClick={() =>
                    setTripType((current) =>
                      current === option.slug ? "" : option.slug,
                    )
                  }
                >
                  {option.name}
                </TagChip>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <RadioCards
              name="finder-budget-band"
              label="Budget band"
              columns={2}
              options={BUDGET_OPTIONS}
              value={budgetBand}
              onChange={setBudgetBand}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            loading={state.status === "loading"}
          >
            <Search aria-hidden="true" className="size-5" />
            Find matches
          </Button>
          <p className="text-xs font-semibold text-ink-soft">
            Filters match our published catalogue — nothing is invented.
          </p>
        </div>
      </form>

      <div aria-live="polite" className="mt-6">
        {state.status === "error" && state.error ? (
          <p className="break-words border border-line bg-tomato px-4 py-3 text-sm font-bold">
            {state.error}
          </p>
        ) : null}

        {state.status === "done" && !hasResults ? (
          <EmptyState
            eyebrow="Trip finder"
            title="No matches yet"
            description="No matches yet — try different filters or plan a custom trip."
            tone="lavender"
            illustration="search"
            className="py-8 sm:py-10"
            action={
              <Button asChild variant="default" size="md">
                <Link href="/plan-my-trip">Plan a custom trip</Link>
              </Button>
            }
          />
        ) : null}

        {state.status === "done" && hasResults ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <ResultPanel
              title="Destinations"
              count={state.destinations.length}
              emptyLabel="No destinations match these filters."
            >
              {state.destinations.map((destination) => (
                <li key={destination.slug}>
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="press flex items-center gap-3 border border-line bg-paper p-3 shadow-hard-xs"
                  >
                    <FinderThumb src={destination.image} alt={destination.name} />
                    <span className="grid min-w-0 gap-1">
                      <span className="truncate font-display text-sm uppercase">
                        {destination.name}
                      </span>
                      <span className="truncate text-xs font-semibold text-ink-soft">
                        {destination.state}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ResultPanel>

            <ResultPanel
              title="Packages"
              count={state.packages.length}
              emptyLabel="No packages match these filters."
            >
              {state.packages.map((pkg) => (
                <li key={pkg.slug}>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="press flex items-center gap-3 border border-line bg-paper p-3 shadow-hard-xs"
                  >
                    <FinderThumb src={pkg.image} alt={pkg.title} />
                    <span className="grid min-w-0 gap-1">
                      <span className="truncate font-display text-sm uppercase">
                        {pkg.title}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-ink-soft">
                        {pkg.destinationName ? <span>{pkg.destinationName}</span> : null}
                        <span className="inline-flex items-center gap-1">
                          <Clock3 aria-hidden="true" className="size-3" />
                          {pluralize(pkg.durationDays, "day")}
                        </span>
                        {pkg.price !== null ? (
                          <span className="inline-flex items-center gap-1 text-ink">
                            <Wallet aria-hidden="true" className="size-3" />
                            {formatPrice(pkg.price, pkg.currency)}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ResultPanel>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FinderThumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <BrutalImage
      src={src}
      alt={alt}
      aspect="square"
      zoom={false}
      sizes="64px"
      className="h-16 w-16 shrink-0 border-0"
    />
  );
}

function ResultPanel({
  title,
  count,
  emptyLabel,
  children,
}: {
  title: string;
  count: number;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-lavender p-4 shadow-hard">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-h4 uppercase">{title}</h3>
        <span className="label-brutal border border-line bg-paper px-2 py-1">
          {pluralize(count, "match", "matches")}
        </span>
      </div>

      {count === 0 ? (
        <p className="mt-3 text-sm font-medium text-ink-soft">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 grid gap-2">{children}</ul>
      )}
    </div>
  );
}
