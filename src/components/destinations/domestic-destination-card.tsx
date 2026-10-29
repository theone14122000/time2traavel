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
        "group card-shine skeleton relative block aspect-[3/4] h-full w-full overflow-hidden rounded-2xl border border-line bg-ink shadow-hard-sm",
        "transition-[transform,box-shadow] duration-300 [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:shadow-hard-lg",
        "active:scale-[0.99] touch-manipulation",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 25vw"
          placeholder={blur ? "blur" : "empty"}
          blurDataURL={blur}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
        />
      ) : null}

      {/* legibility gradient */}
      <span
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
      />

      <span className="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink backdrop-blur">
        Domestic
      </span>

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-tight sm:text-[1.65rem]">
              {destination.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-white/80">
              {destination.tagline}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-all duration-300 group-hover:bg-gold group-hover:translate-x-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
