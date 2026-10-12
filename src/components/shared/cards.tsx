import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Clock3 } from "lucide-react";
import { Media } from "@/components/shared/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn, formatPrice, durationLabel } from "@/lib/utils";
import type { DestinationCard as DestinationData } from "@/lib/data/destinations";
import type { PackageCard as PackageData } from "@/lib/data/packages";

export function DestinationCard({
  destination,
  className,
  onEnquire,
  sizes = "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw",
}: {
  destination: DestinationData;
  className?: string;
  onEnquire?: (destination: DestinationData) => void;
  sizes?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border-[3px] border-ink bg-paper shadow-hard transition-transform duration-150",
        "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg",
        className,
      )}
    >
      <Media
        src={destination.image}
        alt={destination.imageAlt}
        label={destination.name}
        sizes={sizes}
        ratio="destination"
      />

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="dark" size="sm">
            {destination.state}
          </Badge>
          {destination.region ? (
            <Badge variant="soft" size="sm">
              {destination.region}
            </Badge>
          ) : null}
        </div>

        <h3 className="font-display text-h3 uppercase leading-none">
          {destination.name}
        </h3>

        {destination.summary ? (
          <p className="line-clamp-3 text-sm font-medium leading-relaxed text-ink-soft">
            {destination.summary}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
            <MapPin
              aria-hidden="true"
              className="size-4 shrink-0 border-[2px] border-ink bg-mint-strong p-0.5"
            />
            <span>{destination.state}</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/destinations/${destination.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "tap-44 flex-1")}
            >
              Explore
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="tap-44 flex-1"
              onClick={() => onEnquire?.(destination)}
            >
              Enquire
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PackageCard({
  pkg,
  className,
  onEnquire,
  sizes = "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw",
}: {
  pkg: PackageData;
  className?: string;
  onEnquire?: (pkg: PackageData) => void;
  sizes?: string;
}) {
  const duration = durationLabel(pkg.durationDays, pkg.durationLabel);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border-[3px] border-ink bg-paper shadow-hard transition-transform duration-150",
        "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg",
        className,
      )}
    >
      <Media
        src={pkg.image}
        alt={pkg.imageAlt}
        label={pkg.title}
        sizes={sizes}
        ratio="package"
      />

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {pkg.destination ? (
            <Badge variant="sky" size="sm">
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

        <h3 className="font-display text-h3 uppercase leading-none">{pkg.title}</h3>

        {pkg.summary ? (
          <p className="line-clamp-3 text-sm font-medium leading-relaxed text-ink-soft">
            {pkg.summary}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t-[3px] border-ink pt-3">
          <div>
            <span className="label-brutal block text-ink-soft">Price</span>
            <span className="font-display text-lg leading-tight">
              {pkg.price != null
                ? formatPrice(pkg.price, pkg.currency)
                : (pkg.priceNote ?? "On request")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/packages/${pkg.slug}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "tap-44 flex-1")}
          >
            Explore
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="tap-44 flex-1"
            onClick={() => onEnquire?.(pkg)}
          >
            Enquire
          </Button>
        </div>
      </div>
    </article>
  );
}
