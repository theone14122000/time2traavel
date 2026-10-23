import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand logo — replaces the text wordmark with the real logo image.
 * Sensible fixed height, crisp on retina, links to /.
 */
export function Logo({
  className,
  href = "/",
  height = 32,
  priority = false,
  onClick,
}: {
  className?: string;
  href?: string | null;
  height?: number;
  priority?: boolean;
  onClick?: () => void;
}) {
  const width = Math.round(height * (1742 / 903));
  const mark = (
    <Image
      src="/images/logo/logo.png"
      alt="Time to Travel"
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn("h-auto w-auto", className)}
      style={{ height, width: "auto" }}
    />
  );

  if (!href) return mark;

  return (
    <Link href={href} className="shrink-0" aria-label="Time to Travel — home" onClick={onClick}>
      {mark}
    </Link>
  );
}
