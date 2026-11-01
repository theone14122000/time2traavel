import * as React from "react";
import { Camera, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Honest stand-in for a photograph that has not been supplied yet.
 * Dashed frame + icon + a plain label, so it reads as "photo goes here"
 * and never as a broken image. Swap it for a real <Image> when the photo exists.
 */
export function PhotoPlaceholder({
  label,
  kind = "photo",
  className,
}: {
  label: string;
  kind?: "photo" | "person";
  className?: string;
}) {
  const Icon = kind === "person" ? UserRound : Camera;
  return (
    <div
      role="img"
      aria-label={`${label} (photo coming soon)`}
      className={cn(
        "relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-sand via-cream to-sky",
        className,
      )}
    >
      <span aria-hidden="true" className="absolute inset-3 rounded-[inherit] border border-dashed border-ink/25" />
      <div className="relative flex flex-col items-center gap-2.5 px-4 text-center text-ink-soft">
        <span className="grid size-14 place-items-center rounded-full border border-line-strong bg-white/70">
          <Icon aria-hidden="true" className="size-6 text-bronze" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</span>
        <span className="text-xs">Photo coming soon</span>
      </div>
    </div>
  );
}
