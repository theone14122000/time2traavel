import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 font-semibold uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        default: "bg-gold/25 text-[#5f4818]",
        tomato: "bg-gold/25 text-[#5f4818]",
        sunrise: "bg-sunrise text-ink",
        mint: "bg-mint text-ink",
        sky: "bg-sky text-ink",
        peach: "bg-peach text-ink",
        lavender: "bg-lavender text-ink",
        blush: "bg-blush text-ink",
        sand: "bg-sand text-ink",
        dark: "bg-ink text-cream",
        outline: "border-line-strong bg-transparent text-ink",
        soft: "border-line bg-paper text-ink",
        "mint-strong": "bg-mint-strong/50 text-ink",
        "sky-strong": "bg-sky-strong/25 text-ink",
        coral: "bg-coral text-ink",
        danger: "bg-danger text-paper",
        success: "bg-mint-strong/50 text-ink",
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

/** Quiet pill badge — for DB flags only (e.g. featured → "Popular"). */
export function Stamp({
  children,
  className,
  rotate: _rotate,
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
            className={cn(
        "pointer-events-none inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase leading-none tracking-[0.12em] shadow-hard-xs",
        badgeVariants({ variant: variant ?? "default", size: "md" }),
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
        "label-brutal inline-flex items-center border-y border-r border-line px-3 py-1.5",
        badgeVariants({ variant: variant ?? "tomato", size: "md" }),
        "border-y border-r border-l-0",
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
        "label-brutal tap-44 inline-flex shrink-0 items-center border border-line px-3.5 py-2.5 transition-all",
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
