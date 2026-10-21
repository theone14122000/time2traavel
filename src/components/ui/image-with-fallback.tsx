"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  /** Primary image source. */
  src: string;
  /** Alt text for the image. Never shown as visible text. */
  alt: string;
  /**
   * Ordered fallback sources tried when `src` fails to load.
   * The first one that loads wins.
   */
  fallbackSrcs?: readonly string[];
  /** Placeholder artwork rendered when every source fails. */
  poster?: React.ReactNode;
  /** `next/image` sizes hint. */
  sizes?: string;
  /** next/image quality (1-100). */
  quality?: number;
  /** Eager-load + preload (above the fold). */
  priority?: boolean;
  /** Small base64 preview used as the blur placeholder. */
  blurDataURL?: string;
  /** Extra classes for the wrapping element. */
  className?: string;
  /** Extra classes for the `<img>` itself. */
  imageClassName?: string;
  /** Called once a source has successfully loaded. */
  onLoaded?: () => void;
};

/**
 * `<Image>` that survives a broken source.
 *
 * Behaviour:
 *  - the first source that loads is shown;
 *  - if a source errors, the next fallback is tried automatically;
 *  - if every source fails, the `poster` artwork is rendered instead;
 *  - the `<img>` stays transparent until it has loaded, so a failed image
 *    can never display its alt text as visible text.
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackSrcs = [],
  poster,
  sizes = "100vw",
  quality = 80,
  priority = false,
  blurDataURL,
  className,
  imageClassName,
  onLoaded,
}: Props) {
  const candidates = React.useMemo(
    () => [src, ...fallbackSrcs].filter(Boolean),
    [src, fallbackSrcs],
  );
  const [candidate, setCandidate] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [exhausted, setExhausted] = React.useState(false);

  // Reset when the primary source changes.
  React.useEffect(() => {
    setCandidate(null);
    setLoaded(false);
    setExhausted(false);
  }, [src]);

  const active = candidate ?? candidates[0] ?? null;
  const activeIndex = active ? candidates.indexOf(active) : -1;

  const handleError = React.useCallback(() => {
    const next = candidates[activeIndex + 1];
    if (next) {
      setCandidate(next);
      setLoaded(false);
    } else {
      setExhausted(true);
    }
  }, [activeIndex, candidates]);

  const handleLoad = React.useCallback(() => {
    setLoaded(true);
    onLoaded?.();
  }, [onLoaded]);

  return (
    <span
      className={cn("relative block h-full w-full overflow-hidden", className)}
    >
      {exhausted
        ? (poster ?? (
            <span
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center bg-butter"
            >
              <svg
                viewBox="0 0 120 90"
                className="h-full w-full"
                preserveAspectRatio="xMidYMid slice"
              >
                <circle cx="88" cy="26" r="14" fill="#FFE45E" stroke="#0a0a0a" strokeWidth={3} />
                <polygon points="0,90 38,38 66,90" fill="#B8F2D0" stroke="#0a0a0a" strokeWidth={3} />
                <polygon points="48,90 82,52 120,90" fill="#A9D8FF" stroke="#0a0a0a" strokeWidth={3} />
              </svg>
            </span>
          ))
        : null}

      {active && !exhausted ? (
        <Image
          key={active}
          src={active}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      ) : null}
    </span>
  );
}
