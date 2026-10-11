"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Clock3, MapPin, Tag } from "lucide-react";
import { PackageEnquiryButton } from "@/components/packages/package-enquiry";
import { useCompare } from "@/components/packages/compare-context";
import { cn } from "@/lib/utils";
import type { PackageCard as PackageCardData } from "@/lib/data/packages";

/**
 * Sticky booking-style sidebar for the package detail page.
 * Price is only shown when the database has one — otherwise the admin
 * priceNote (or an honest "On request" label) is used. Never invented.
 */
export function PackageDetailActions({
  slug,
  title,
  priceLabel,
  durationText,
  destinationName,
  destinationSlug,
  comparePkg,
}: {
  slug: string;
  title: string;
  priceLabel: string | null;
  durationText: string | null;
  destinationName?: string | null;
  destinationSlug?: string | null;
  /** Card payload — only needed when the page wants an "add to compare" toggle. */
  comparePkg?: PackageCardData;
}) {
  const compare = useCompare();
  const compared = comparePkg ? compare.isSelected(comparePkg.id) : false;

  return (
    <aside
      aria-label={`Enquiry options for ${title}`}
      className="border-4 border-ink bg-paper p-5 shadow-brutal-md lg:sticky lg:top-24"
    >
      <div className="border-[3px] border-ink bg-sunrise px-4 py-3 shadow-brutal-sm">
        <span className="label-brutal text-ink-soft">From</span>
        <p className="mt-1 font-display text-h3 uppercase leading-tight">
          {priceLabel ?? "On request"}
        </p>
      </div>

      <ul className="mt-4 grid gap-2.5 text-sm font-semibold">
        {durationText ? (
          <li className="flex items-center gap-2">
            <Clock3 aria-hidden="true" className="size-4 shrink-0 border-[2px] border-ink bg-sky-strong p-0.5" />
            {durationText}
          </li>
        ) : null}
        {destinationName && destinationSlug ? (
          <li className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 shrink-0 border-[2px] border-ink bg-mint-strong p-0.5" />
            <Link
              href={`/destinations/${destinationSlug}`}
              className="underline-offset-4 hover:underline"
            >
              {destinationName}
            </Link>
          </li>
        ) : null}
        <li className="flex items-center gap-2">
          <Tag aria-hidden="true" className="size-4 shrink-0 border-[2px] border-ink bg-lemon p-0.5" />
          Custom dates on request
        </li>
      </ul>

      <PackageEnquiryButton
        slug={slug}
        title={title}
        size="lg"
        className="mt-5 w-full"
      />

      {comparePkg && compare.enabled ? (
        <button
          type="button"
          aria-pressed={compared}
          onClick={() => compare.toggle(comparePkg)}
          className={cn(
            "tap-44 mt-3 flex w-full items-center justify-center gap-2 border-[3px] border-ink px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors",
            compared
              ? "bg-lemon"
              : "bg-paper shadow-brutal-sm hover:bg-butter",
          )}
        >
          <Check aria-hidden="true" className="size-4" />
          {compared ? "In compare" : "Add to compare"}
        </button>
      ) : null}

      <p className="mt-3 text-center text-xs font-medium text-ink-soft">
        Send an enquiry — we&apos;ll reply with availability and the next steps.
      </p>
    </aside>
  );
}
