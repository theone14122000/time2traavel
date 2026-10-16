import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border-[2px] border-ink px-2.5 py-1 font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-lemon text-ink",
        tomato: "bg-tomato text-ink",
        sunrise: "bg-sunrise text-ink",
        mint: "bg-mint text-ink",
        sky: "bg-sky text-ink",
        peach: "bg-peach text-ink",
        lavender: "bg-lavender text-ink",
        blush: "bg-blush text-ink",
        sand: "bg-sand text-ink",
        dark: "bg-ink text-cream",
        outline: "bg-transparent text-ink",
        soft: "bg-paper text-ink",
        "mint-strong": "bg-mint-strong text-ink",
        "sky-strong": "bg-sky-strong text-ink",
        coral: "bg-coral text-ink",
        danger: "bg-danger text-paper",
        success: "bg-mint-strong text-ink",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

/** Rotated "sticker" badge â€” for DB flags only (e.g. featured â†’ "Popular"). */
export function Stamp({
  children,
  className,
  rotate = -6,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  variant?: BadgeProps["variant"];
}) {
  return (
    <span
      aria-hidden="true"
      style={{ rotate: `${rotate}deg` }}
      className={cn(
        "pointer-events-none inline-flex items-center border-[3px] border-ink px-2.5 py-1 font-display text-xs uppercase leading-none shadow-hard-xs",
        badgeVariants({ variant: variant ?? "default", size: "md" }),
        "border-[3px]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Edge ribbon for corner callouts. */
export function Ribbon({
  children,
  className,
  variant = "tomato",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeProps["variant"];
}) {
  return (
    <span
      className={cn(
        "label-brutal inline-flex items-center border-y-[2px] border-r-[2px] border-ink px-3 py-1.5",
        badgeVariants({ variant: variant ?? "tomato", size: "md" }),
        "border-y-[2px] border-r-[2px] border-l-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Simple filter/tag chip with pressed state. */
export function TagChip({
  children,
  active = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "label-brutal tap-44 inline-flex shrink-0 items-center border-[2px] border-ink px-3.5 py-2.5 transition-all",
        active
          ? "bg-lemon shadow-hard-xs"
          : "bg-paper shadow-hard-xs hover:bg-butter hover:-translate-x-0.5 hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { badgeVariants };
