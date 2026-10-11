"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { getSavedItemsAction } from "@/actions/public-content";
import { DestinationCard, PackageCard } from "@/components/shared/cards";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import type { DestinationCard as DestinationData } from "@/lib/data/destinations";
import type { PackageCard as PackageData } from "@/lib/data/packages";

/**
 * Client-side saved-items view: reads wishlist ids from localStorage,
 * hydrates published cards through `getSavedItemsAction`, and lets the
 * traveller remove or clear items. All listing data comes from the DB.
 */
export function SavedView() {
  const {
    ready,
    destinations: destinationIds,
    packages: packageIds,
    toggleDestination,
    togglePackage,
    clearAll,
  } = useWishlist();

  const [destinations, setDestinations] = React.useState<DestinationData[]>([]);
  const [packages, setPackages] = React.useState<PackageData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const idSignature = React.useMemo(
    () => `${destinationIds.join(",")}|${packageIds.join(",")}`,
    [destinationIds, packageIds],
  );

  React.useEffect(() => {
    if (!ready) return;

    if (destinationIds.length === 0 && packageIds.length === 0) {
      setDestinations([]);
      setPackages([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getSavedItemsAction({ destinationIds, packageIds })
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          setDestinations(response.destinations);
          setPackages(response.packages);
          setError(null);
        } else {
          setError(response.error ?? "Couldn't load your saved items.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your saved items. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, idSignature]);

  if (!ready) {
    return (
      <div className="flex items-center gap-2 border-4 border-ink bg-paper p-6 shadow-brutal-md">
        <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        <p className="text-sm font-semibold">Loading your saved items…</p>
      </div>
    );
  }

  const isEmpty = destinationIds.length === 0 && packageIds.length === 0;

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="label-brutal text-ink-soft">
          {destinationIds.length} saved{" "}
          {destinationIds.length === 1 ? "destination" : "destinations"}
          {" · "}
          {packageIds.length} saved {packageIds.length === 1 ? "package" : "packages"}
        </p>
        {!isEmpty ? (
          <Button type="button" variant="outline" size="sm" onClick={() => clearAll()}>
            <Trash2 aria-hidden="true" className="size-4" />
            Clear all
          </Button>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="border-[3px] border-ink bg-danger px-4 py-3 text-sm font-semibold text-paper"
        >
          {error}
        </p>
      ) : null}

      {isEmpty ? (
        <EmptyState
          eyebrow="Saved items"
          title="Nothing saved yet"
          description="Tap the heart on any destination or package to keep it here. Your list stays on this device."
          tone="lavender"
          illustration="luggage"
          icon={<Heart className="size-8" aria-hidden="true" />}
          action={
            <>
              <Button asChild variant="default" size="md">
                <Link href="/destinations">Browse destinations</Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/packages">Browse packages</Link>
              </Button>
            </>
          }
        />
      ) : (
        <>
          <section aria-labelledby="saved-destinations-heading" className="grid gap-6">
            <h2 id="saved-destinations-heading" className="font-display text-h3 uppercase">
              Destinations ({destinationIds.length})
            </h2>
            {destinationIds.length === 0 ? (
              <p className="text-sm font-medium text-ink-soft">
                No saved destinations yet — tap a heart on any destination card.
              </p>
            ) : loading && destinations.length === 0 ? (
              <div className="flex items-center gap-2 border-4 border-ink bg-paper p-6 shadow-brutal-md">
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
                <p className="text-sm font-semibold">Loading destinations…</p>
              </div>
            ) : destinations.length === 0 ? (
              <p className="text-sm font-medium text-ink-soft">
                Some saved destinations are no longer published.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((destination) => (
                  <div key={destination.id} className="relative">
                    <DestinationCard destination={destination} />
                    <button
                      type="button"
                      onClick={() => toggleDestination(destination.id)}
                      aria-label={`Remove ${destination.name} from saved`}
                      className="tap-44 absolute right-3 top-3 flex size-11 items-center justify-center border-[3px] border-ink bg-paper text-tomato shadow-hard-xs transition-colors hover:bg-lemon"
                    >
                      <Heart aria-hidden="true" className="size-5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="saved-packages-heading" className="grid gap-6">
            <h2 id="saved-packages-heading" className="font-display text-h3 uppercase">
              Packages ({packageIds.length})
            </h2>
            {packageIds.length === 0 ? (
              <p className="text-sm font-medium text-ink-soft">
                No saved packages yet — tap a heart on any package card.
              </p>
            ) : loading && packages.length === 0 ? (
              <div className="flex items-center gap-2 border-4 border-ink bg-paper p-6 shadow-brutal-md">
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
                <p className="text-sm font-semibold">Loading packages…</p>
              </div>
            ) : packages.length === 0 ? (
              <p className="text-sm font-medium text-ink-soft">
                Some saved packages are no longer published.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="relative">
                    <PackageCard pkg={pkg} />
                    <button
                      type="button"
                      onClick={() => togglePackage(pkg.id)}
                      aria-label={`Remove ${pkg.title} from saved`}
                      className="tap-44 absolute right-3 top-3 flex size-11 items-center justify-center border-[3px] border-ink bg-paper text-tomato shadow-hard-xs transition-colors hover:bg-lemon"
                    >
                      <Heart aria-hidden="true" className="size-5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
