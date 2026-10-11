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
        "mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10 xl:px-14",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
