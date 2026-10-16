import { cva } from "class-variance-authority";

/** Server-safe variant map (no client hooks) — use with `<Link className={buttonVariants(...)}>`. */
export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "border-[3px] border-ink font-bold uppercase tracking-wide",
    "shadow-hard-sm transition-[transform,box-shadow,background-color] duration-100 ease-out",
    "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard",
    "active:translate-x-1 active:translate-y-1 active:shadow-none",
    "disabled:pointer-events-none disabled:opacity-50",
    /* Focus ring comes from the global :focus-visible rule (3px ink + 2px lemon) */
    "aria-busy:opacity-80",
  ],
  {
    variants: {
      variant: {
        // hot CTA accent
        default: "bg-tomato text-ink hover:bg-tomato",
        primary: "bg-tomato text-ink hover:bg-tomato",
        secondary: "bg-lemon text-ink hover:bg-lemon",
        dark: "bg-ink text-cream hover:bg-ink",
        outline: "bg-paper text-ink hover:bg-butter",
        soft: "bg-butter text-ink hover:bg-lemon",
        danger: "bg-danger text-paper hover:bg-danger",
        ghost:
          "border-transparent bg-transparent text-ink shadow-none hover:border-ink hover:shadow-hard-xs",
        link: "border-transparent bg-transparent text-ink shadow-none underline-offset-4 hover:translate-x-0 hover:translate-y-0 hover:shadow-none hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs min-w-[44px]",
        md: "h-11 px-5 text-xs min-w-[44px]",
        lg: "h-14 px-7 text-sm sm:text-base min-w-[44px]",
        xl: "h-16 px-8 text-base sm:text-lg min-w-[44px]",
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
