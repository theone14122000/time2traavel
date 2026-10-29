import { cva } from "class-variance-authority";

/** Server-safe variant map (no client hooks) — use with `<Link className={buttonVariants(...)}>`. */
export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "border font-semibold tracking-wide",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out",
    "hover:-translate-y-0.5 active:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-busy:opacity-80",
  ],
  {
    variants: {
      variant: {
        // primary action — deep forest
        default:
          "border-forest bg-forest text-white shadow-hard-sm hover:bg-[var(--tt-forest-hover)] hover:shadow-hard",
        primary:
          "border-forest bg-forest text-white shadow-hard-sm hover:bg-[var(--tt-forest-hover)] hover:shadow-hard",
        // champagne accent
        secondary:
          "border-gold bg-gold text-ink shadow-hard-sm hover:brightness-105 hover:shadow-hard",
        dark: "border-ink bg-ink text-cream hover:bg-[#0a1420]",
        outline:
          "border-line-strong bg-paper text-ink hover:border-ink hover:bg-cream",
        soft: "border-transparent bg-sand text-ink hover:bg-[#dfd9cc]",
        danger: "border-danger bg-danger text-paper hover:brightness-95",
        ghost:
          "border-transparent bg-transparent text-ink hover:bg-ink/5",
        link: "rounded-none border-transparent bg-transparent text-ink underline-offset-4 hover:translate-y-0 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-xs min-w-[44px]",
        md: "h-11 px-6 text-sm min-w-[44px]",
        lg: "h-13 px-8 text-sm sm:text-base min-w-[44px]",
        xl: "h-14 px-9 text-base min-w-[44px]",
        icon: "size-11 p-0",
        "icon-sm": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);
