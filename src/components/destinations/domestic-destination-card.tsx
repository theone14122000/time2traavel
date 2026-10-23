import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { imageInfo, originalUrl } from "@/lib/domestic-destinations";
import type { DomesticDestination } from "@/lib/domestic-destinations";
import { CardArrow } from "@/components/ui/card";

type Props = {
  destination: DomesticDestination;
  className?: string;
};

/**
 * Domestic destination card — mobile-first, image-first, dynamic.
 *
 * - Mobile: full-width snap card (86vw) with peek; image 4:5, min 440px
 * - Tablet: 2 columns
 * - Desktop: 4 columns, 480-520px min height
 * - Hover (desktop only): lift, shadow grow, image zoom 1.05
 * - Tap feedback on touch
 * - Caption panel overlaps image bottom with name + tagline + arrow
 * - Domestic badge top-left
 * - Whole card is one link
 */
export function DomesticDestinationCard({ destination, className }: Props) {
  const cover = destination.images[
    Math.min(destination.coverIndex, destination.images.length - 1)
  ] ?? destination.images[0];
  const info = cover ? imageInfo(cover) : null;
  const src = info?.thumb ?? (cover ? originalUrl(cover) : null);
  const blur = info?.thumbBlurDataURL ?? info?.blurDataURL ?? undefined;

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      aria-label={`Explore ${destination.name}`}
      className={cn(
        "group relative block h-full overflow-hidden rounded-sm border-[3px] border-ink bg-paper shadow-hard",
        "transition-[transform,box-shadow] duration-200",
        "hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-hard-lg",
        "active:translate-y-0 active:shadow-hard",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink",
        "touch-manipulation",
        className,
      )}
    >
      {/* Image area — at least 60% of card, 4:5 aspect */}
      <div className="relative aspect-[4/5] min-h-[440px] w-full overflow-hidden bg-butter sm:min-h-[480px] lg:min-h-[520px]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 25vw"
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
          />
        ) : null}

        {/* inner keyline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[6px] border-2 border-ink/80"
        />

        {/* Domestic badge top-left */}
        <span className="label-brutal absolute left-3 top-3 z-20 border-[2px] border-ink bg-lemon px-2 py-1 text-ink">
          Domestic
        </span>
      </div>

      {/* Caption panel overlapping the image bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t-[3px] border-ink bg-paper/95 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[1.5rem] uppercase leading-none text-ink sm:text-[1.75rem]">
              {destination.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[0.9375rem] font-medium leading-snug text-ink-soft">
              {destination.tagline}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-lemon text-ink transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
