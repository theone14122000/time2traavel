import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  className,
  size = "md",
  label,
}: {
  rating: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));
  const sizeClass =
    size === "sm" ? "size-3.5" : size === "lg" ? "size-6" : "size-4.5";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={label ?? `Rated ${clamped} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < clamped;
        return (
          <Star
            key={index}
            aria-hidden="true"
            className={cn(
              sizeClass,
              "border border-line p-[1px]",
              filled ? "fill-lemon bg-lemon" : "fill-paper bg-paper",
            )}
          />
        );
      })}
    </div>
  );
}
