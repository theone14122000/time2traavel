import * as React from "react";
import Image from "next/image";
import { cn, absoluteUrl } from "@/lib/utils";

type MediaProps = {
  src?: string | null;
  alt?: string | null;
  /** Fallback label drawn inside the placeholder (usually the item name). */
  label?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  ratio?: "video" | "square" | "wide" | "portrait" | "banner";
  objectPosition?: string;
};

const ratios: Record<NonNullable<MediaProps["ratio"]>, string> = {
  video: "aspect-[4/3]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
  banner: "aspect-[21/9]",
};

/**
 * Image with a designed brutalist placeholder when nothing is uploaded yet.
 * Admin-uploaded images use next/image (Cloudinary remote or /uploads local).
 */
export function Media({
  src,
  alt,
  label,
  className,
  imgClassName,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  ratio = "video",
  objectPosition,
}: MediaProps) {
  const hasImage = Boolean(src && src.trim().length > 0);
  const safeAlt = alt?.trim() || (label ? `${label}` : "");

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b-[3px] border-ink bg-butter",
        ratios[ratio],
        className,
      )}
    >
      {hasImage ? (
        <Image
          src={src as string}
          alt={safeAlt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imgClassName)}
          style={objectPosition ? { objectPosition } : undefined}
        />
      ) : (
        <div
          role="img"
          aria-label={safeAlt ? `${safeAlt} (no image uploaded yet)` : "Image coming soon"}
          className="grid-lines absolute inset-0 flex flex-col items-center justify-center gap-2 bg-butter"
        >
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center border-[3px] border-ink bg-paper font-display text-lg shadow-hard-xs"
          >
            {(label ?? "?").trim().charAt(0).toUpperCase() || "?"}
          </span>
          <span className="label-brutal max-w-[80%] truncate px-2 text-center text-[0.6rem]">
            {label ?? "Image coming soon"}
          </span>
        </div>
      )}
    </div>
  );
}

/** Helper for absolute OG/social images. */
export function ogImageUrl(path?: string | null): string {
  return path ? absoluteUrl(path) : absoluteUrl("/og-image.svg");
}
