"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock3, MapPin, Send } from "lucide-react";
import {
  BrutalCard,
  BrutalCardBody,
  BrutalCardFooter,
} from "@/components/ui/brutal-card";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Badge, Stamp } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickViewButton } from "@/components/packages/quick-view";
import { useCompare } from "@/components/packages/compare-context";
import { cn, durationLabel, formatPrice } from "@/lib/utils";
import type { PackageCard as PackageCardData } from "@/lib/data/packages";

/**
 * Neo-brutalist package tile: hard-framed image, real DB chips only
 * (destination / duration / featured) and a price block that prints a
 * figure only when the catalogue actually stores one.
 */
export function PackageTile({
  pkg,
  onEnquire,
  showCompare = true,
}: {
  pkg: PackageCardData;
  onEnquire?: (pkg: PackageCardData) => void;
  /** Hide the compare toggle on grids outside the compare provider. */
  showCompare?: boolean;
}) {
  const compare = useCompare();
  const duration = durationLabel(pkg.durationDays, pkg.durationLabel);
  const compared = showCompare && compare.enabled && compare.isSelected(pkg.id);
  const showCompareToggle = showCompare && compare.enabled;
  const hasPrice = pkg.price != null;
  const hasPriceBlock = hasPrice || Boolean(pkg.priceNote?.trim());

  return (
    <BrutalCard
      variant="package"
      className="flex h-full flex-col"
      // featured is a real DB flag; no "New" stamp because card data has no createdAt.
      sticker={pkg.featured ? <Stamp>Popular</Stamp> : undefined}
    >
      <div className="border-b-[3px] border-ink">
        <BrutalImage
          src={pkg.image}
          alt={pkg.imageAlt ?? pkg.title}
          aspect="package"
          className="border-0"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 46vw, 30vw"
        />
      </div>

      <BrutalCardBody className="flex flex-1 flex-col gap-3 space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          {pkg.destination ? (
            <Badge variant="sky" size="sm">
              <MapPin aria-hidden="true" className="size-3" />
              {pkg.destination.name}
            </Badge>
          ) : null}
          {duration ? (
            <Badge variant="soft" size="sm">
              <Clock3 aria-hidden="true" className="size-3" />
              {duration}
            </Badge>
          ) : null}
        </div>

        <h3 className="font-display text-h3 uppercase leading-tight">
          <Link
            href={`/packages/${pkg.slug}`}
            className="py-2 decoration-[3px] underline-offset-4 hover:underline"
          >
            {pkg.title}
          </Link>
        </h3>

        {pkg.summary ? (
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-ink-soft">
            {pkg.summary}
          </p>
        ) : null}

        {hasPriceBlock ? (
          <div className="mt-auto border-[3px] border-ink bg-mint px-3 py-2 shadow-brutal-sm">
            <span className="label-brutal text-ink-soft">Price</span>
            <p className="mt-1 font-display text-lg leading-tight">
              {hasPrice ? `From ${formatPrice(pkg.price, pkg.currency)}` : pkg.priceNote}
            </p>
            {hasPrice && pkg.priceNote ? (
              <p className="mt-0.5 text-xs font-medium text-ink-soft">{pkg.priceNote}</p>
            ) : null}
          </div>
        ) : null}
      </BrutalCardBody>

      <BrutalCardFooter className="flex-col items-stretch gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="tap-44 flex-1"
            onClick={() => onEnquire?.(pkg)}
          >
            <Send aria-hidden="true" className="size-4" />
            Enquire
          </Button>
          <QuickViewButton pkg={pkg} className="tap-44 flex-1" />
        </div>

        {showCompareToggle ? (
          <button
            type="button"
            aria-pressed={compared}
            onClick={() => compare.toggle(pkg)}
            className={cn(
              "tap-44 flex w-full items-center gap-2 border-[2px] border-ink px-3 py-2 transition-colors",
              compared ? "bg-lemon" : "bg-paper hover:bg-butter",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 shrink-0 items-center justify-center border-[3px] border-ink bg-paper",
                compared && "bg-lemon",
              )}
            >
              {compared ? <Check aria-hidden="true" className="size-3" strokeWidth={4} /> : null}
            </span>
            <span className="label-brutal">{compared ? "In compare" : "Compare"}</span>
          </button>
        ) : null}
      </BrutalCardFooter>
    </BrutalCard>
  );
}
