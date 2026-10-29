"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  /** Cursor-reactive nudge on desktop pointers (disabled for touch/reduced motion). */
  magnetic?: boolean;
  /** Max magnetic travel in px. */
  magneticStrength?: number;
}

function useMagnetic<T extends HTMLElement>(
  enabled: boolean,
  strength: number,
  ref: React.RefObject<T | null>,
) {
  React.useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const el = ref.current;
    if (!el) return;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.transform = `translate(${(x * strength).toFixed(1)}px, ${(y * strength).toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, strength, ref]);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      magnetic = false,
      magneticStrength = 5,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const localRef = React.useRef<HTMLButtonElement | null>(null);

    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    useMagnetic<HTMLButtonElement>(magnetic && !asChild, magneticStrength, localRef);

    return (
      <Comp
        ref={localRef}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="size-3.5 animate-spin border border-current border-t-transparent"
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
