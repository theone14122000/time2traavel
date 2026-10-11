import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse border-[2px] border-ink/15 bg-paper",
        className,
      )}
      {...props}
    />
  );
}

/** Single text-line placeholder. */
export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full rounded-none", className)} />;
}

/** Title-line placeholder (slightly taller/bolder). */
export function SkeletonTitle({ className }: { className?: string }) {
  return <Skeleton className={cn("h-7 w-2/3 rounded-none", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("border-[3px] border-ink bg-paper shadow-hard", className)}>
      <Skeleton className="aspect-[4/3] w-full border-0 border-b-[3px] border-ink/15 bg-sand/60" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
