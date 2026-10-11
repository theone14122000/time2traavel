import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import {
  BrutalCard,
  BrutalCardBody,
  BrutalCardFooter,
  BrutalCardMedia,
} from "@/components/ui/brutal-card";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Badge, Stamp } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn, durationLabel, formatPrice, pluralize } from "@/lib/utils";
import type { PackageCard as PackageData } from "@/lib/data/packages";

/** Extra database facts the shared card list doesn't carry. */
export type HomePackageMeta = {
  createdAt: string;
  highlightsCount: number;
};

const NEW_PACKAGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** "New" sticker only when the row was created within the last 30 days (DB). */
export function isRecentPackage(createdAt?: string | null): boolean {
  if (!createdAt) return false;
  const time = new Date(createdAt).getTime();
  return Number.isFinite(time) && Date.now() - time <= NEW_PACKAGE_WINDOW_MS;
}

/**
 * Home package card — data-driven, with DB-flag stickers (featured →
 * "Popular", recent → "New"), an honest price block (never invented) and a
 * highlights count preview when the admin published highlights.
 */
export function HomePackageCard({
  pkg,
  meta,
  onEnquire,
  className,
}: {
  pkg: PackageData;
  meta?: HomePackageMeta;
  onEnquire?: (pkg: PackageData) => void;
  className?: string;
}) {
  const duration = durationLabel(pkg.durationDays, pkg.durationLabel);
  const showNew = isRecentPackage(meta?.createdAt);
  const highlightsCount = meta?.highlightsCount ?? 0;

  const sticker =
    pkg.featured || showNew ? (
      <span className="flex flex-col items-start gap-1.5">
        {pkg.featured ? (
          <Stamp rotate={-7} variant="tomato">
            Popular
          </Stamp>
        ) : null}
        {showNew ? (
          <Stamp rotate={6} variant="mint">
            New
          </Stamp>
        ) : null}
      </span>
    ) : null;

  const priceText =
    pkg.price != null ? formatPrice(pkg.price, pkg.currency) : pkg.priceNote?.trim() || null;

  const priceBadge = priceText ? (
    <Badge variant={pkg.price != null ? "default" : "soft"} className="shadow-hard-xs">
      {priceText}
    </Badge>
  ) : null;

  return (
    <BrutalCard
      variant="package"
      sticker={sticker}
      badge={priceBadge}
      className={cn("flex h-full flex-col", className)}
    >
      <BrutalCardMedia aspect="landscape">
        <BrutalImage
          src={pkg.image}
          alt={pkg.imageAlt?.trim() || pkg.title}
          className="aspect-auto h-full w-full border-0"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
        />
      </BrutalCardMedia>

      <BrutalCardBody className="flex flex-1 flex-col gap-3 space-y-0">
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

        {highlightsCount > 0 ? (
          <span className="label-brutal mt-auto w-fit border-[2px] border-ink bg-lemon px-2.5 py-1">
            +{highlightsCount} {pluralize(highlightsCount, "highlight")}
          </span>
        ) : null}
      </BrutalCardBody>

      <BrutalCardFooter className="gap-2.5">
        <Link
          href={`/packages/${pkg.slug}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
        >
          Explore
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => onEnquire?.(pkg)}
        >
          Enquire
        </Button>
      </BrutalCardFooter>
    </BrutalCard>
  );
}
