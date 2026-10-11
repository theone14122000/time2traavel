"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Eye, MapPin, Send } from "lucide-react";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";
import { cn, durationLabel, formatPrice, toStringArray } from "@/lib/utils";
import type { PackageCard } from "@/lib/data/packages";

/**
 * "Quick view" button + modal built from card-level data only — no extra
 * fetch, no invented fields. Anything richer (full highlights, itinerary)
 * lives behind "Full details" on the package detail page.
 *
 * `highlights` is optional: listing cards don't carry it, so the preview
 * only renders when a caller already has detail-level data.
 */
export function QuickViewButton({
  pkg,
  highlights,
  className,
}: {
  pkg: PackageCard;
  highlights?: unknown;
  className?: string;
}) {
  const [quickOpen, setQuickOpen] = React.useState(false);
  const [enquiryOpen, setEnquiryOpen] = React.useState(false);

  const duration = durationLabel(pkg.durationDays, pkg.durationLabel);
  const priceText = pkg.price != null ? formatPrice(pkg.price, pkg.currency) : null;
  const preview = toStringArray(highlights).slice(0, 3);

  const openEnquiry = () => {
    setQuickOpen(false);
    setEnquiryOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={() => setQuickOpen(true)}
      >
        <Eye aria-hidden="true" className="size-4" />
        Quick view
      </Button>

      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{pkg.title}</DialogTitle>
            <DialogDescription>
              {pkg.summary ?? "Open the full page for the complete itinerary and details."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grid gap-4">
            <BrutalImage
              src={pkg.image}
              alt={pkg.imageAlt ?? pkg.title}
              aspect="landscape"
              sizes="(max-width: 768px) 100vw, 640px"
            />

            <div className="flex flex-wrap items-center gap-2">
              {pkg.destination ? (
                <Link
                  href={`/destinations/${pkg.destination.slug}`}
                  className="label-brutal inline-flex items-center gap-1.5 border-[2px] border-ink bg-sky px-2.5 py-1.5 transition-colors hover:bg-sky-strong"
                >
                  <MapPin aria-hidden="true" className="size-3.5" />
                  {pkg.destination.name}
                </Link>
              ) : null}
              {duration ? (
                <Badge variant="soft">
                  <Clock3 aria-hidden="true" className="size-3" />
                  {duration}
                </Badge>
              ) : null}
              {pkg.featured ? <Badge variant="default">Popular</Badge> : null}
            </div>

            <div className="border-[3px] border-ink bg-sunrise px-4 py-3 shadow-brutal-sm">
              <span className="label-brutal text-ink-soft">Price</span>
              <p className="mt-1 font-display text-h4 uppercase leading-tight">
                {priceText ? `From ${priceText}` : (pkg.priceNote ?? "On request")}
              </p>
              {priceText && pkg.priceNote ? (
                <p className="mt-1 text-xs font-medium text-ink-soft">{pkg.priceNote}</p>
              ) : null}
            </div>

            {preview.length > 0 ? (
              <div>
                <h4 className="font-display text-h4 uppercase">Highlights</h4>
                <ul className="mt-2 grid gap-2">
                  {preview.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex items-start gap-2 border-[2px] border-ink bg-paper px-3 py-2 text-sm font-medium"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 size-3 shrink-0 border-[2px] border-ink bg-lemon"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </DialogBody>

          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button type="button" variant="primary" size="md" onClick={openEnquiry}>
              <Send aria-hidden="true" className="size-4" />
              Enquire
            </Button>
            <Link
              href={`/packages/${pkg.slug}`}
              className={cn(buttonVariants({ variant: "dark", size: "md" }), "w-full sm:w-auto")}
            >
              Full details
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EnquiryDialog
        target={{ kind: "package", slug: pkg.slug, name: pkg.title }}
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
      />
    </>
  );
}
