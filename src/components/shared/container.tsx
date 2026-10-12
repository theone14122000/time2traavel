import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Fluid padding: 16 → 24 → 40 → 48px; content capped at 1280px
        // so ultra-wide screens keep generous side margins.
        "mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-10 xl:px-12",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
