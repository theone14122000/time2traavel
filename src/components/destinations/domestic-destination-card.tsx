import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { imageInfo, originalUrl } from "@/lib/domestic-destinations";
import type { DomesticDestination } from "@/lib/domestic-destinations";

type Props = {
  destination: DomesticDestination;
  className?: string;
};

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
        "group relative block h-full overflow-hidden border-[3px] border-ink bg-paper shadow-hard transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-1 hover:shadow-hard-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink",
        "active:translate-y-0 active:shadow-hard",
        className,
      )}
    >
      <div className="relative aspect-[4/5] min-h-[440px] w-full overflow-hidden bg-ink/10 sm:min-h-[480px] lg:min-h-[520px]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 25vw"
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
          />
        ) : null}

        <span className="label-brutal absolute left-3 top-3 z-10 border-[2px] border-ink bg-lemon px-2 py-1 text-ink">
          Domestic
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t-[3px] border-ink bg-paper/95 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-h4 uppercase leading-none text-ink">
              {destination.name}
            </h3>
            <p className="mt-1.5 line-clamp-1 text-sm font-medium text-ink-soft">
              {destination.tagline}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-lemon text-ink transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-110"
          >
            <ArrowRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
