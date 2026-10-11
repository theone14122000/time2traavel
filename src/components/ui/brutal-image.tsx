"use client";

import * as React from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const ALLOWED_HOSTS = new Set(["res.cloudinary.com", "img.youtube.com"]);

function isLocalOrAllowed(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

const aspectClasses: Record<NonNullable<BrutalImageProps["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[3/2]",
  wide: "aspect-[16/9]",
  free: "",
};

function Placeholder() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 90"
      className="h-full w-full bg-butter"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="88" cy="26" r="14" fill="#FFE45E" stroke="#0a0a0a" strokeWidth={3} />
      <polygon points="0,90 38,38 66,90" fill="#B8F2D0" stroke="#0a0a0a" strokeWidth={3} />
      <polygon points="48,90 82,52 120,90" fill="#A9D8FF" stroke="#0a0a0a" strokeWidth={3} />
    </svg>
  );
}

export interface BrutalImageProps {
  /** Image source. Empty/missing renders a brutalist SVG placeholder. */
  src?: string | null;
  /** Required alt text. Decorative images must pass `alt=""` AND `decorative`. */
  alt: string;
  /** Aspect ratio box. `free` leaves height to the parent/children. */
  aspect?: "square" | "portrait" | "landscape" | "wide" | "free";
  className?: string;
  /** Hint next/image to prioritize this asset. */
  priority?: boolean;
  /** `sizes` prop for next/image fill optimization. */
  sizes?: string;
  /** Scale the image slightly on hover (disabled under reduced motion). */
  zoom?: boolean;
  /** Round the corners (rounded-chip). */
  rounded?: boolean;
  /** Explicitly mark as decorative (allows empty alt without a dev warning). */
  decorative?: boolean;
}

/**
 * Framed image with a hard border and butter placeholder. Uses `next/image`
 * for local/allowlisted sources and a plain `<img>` for arbitrary remote URLs
 * (avoids remotePatterns config errors).
 *
 * @example
 * <BrutalImage src={pkg.imageUrl} alt={pkg.title} aspect="landscape" priority />
 */
export function BrutalImage({
  src,
  alt,
  aspect = "landscape",
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, 50vw",
  zoom = true,
  rounded = false,
  decorative = false,
}: BrutalImageProps) {
  const reduceMotion = useReducedMotion();
  const showZoom = zoom && !reduceMotion;

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (alt === "" && !decorative) {
      console.warn(
        "[BrutalImage] `alt` is empty but `decorative` is not true. Pass descriptive alt text or set `decorative`.",
      );
    }
  }, [alt, decorative]);

  const imageNode = src ? (
    isLocalOrAllowed(src) ? (
      <Image
        src={src}
        alt={decorative ? "" : alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", showZoom && "transition-transform duration-500 group-hover:scale-105")}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={decorative ? "" : alt}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "h-full w-full object-cover",
          showZoom && "transition-transform duration-500 group-hover:scale-105",
        )}
      />
    )
  ) : (
    <Placeholder />
  );

  return (
    <div
      className={cn(
        "group relative border-[3px] border-ink bg-butter overflow-hidden",
        aspectClasses[aspect],
        rounded && "rounded-chip",
        className,
      )}
    >
      {imageNode}
    </div>
  );
}
