import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Embedded map (Google Maps iframe — no API key needed) for the office in
 * Kasumpti, Shimla. The URL comes from Site Settings with a safe default.
 */
export function MapEmbed({
  src,
  title = "Time to Travel office location — Kasumpti, Shimla, Himachal Pradesh",
  className,
  height = "h-[320px] sm:h-[420px]",
}: {
  src: string;
  title?: string;
  className?: string;
  height?: string;
}) {
  if (!src) return null;

  return (
    <div className={cn("relative border-[3px] border-ink bg-paper shadow-hard", className)}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className={cn("w-full border-0", height)}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border-[3px] border-ink"
      />
    </div>
  );
}
