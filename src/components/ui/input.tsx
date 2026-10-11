import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-chip border-[3px] border-ink bg-paper px-3.5 py-2 text-sm font-medium text-ink",
      "shadow-hard-xs transition-shadow placeholder:text-ink-soft/60 placeholder:font-normal",
      "focus-visible:outline-none focus-visible:shadow-[4px_4px_0_var(--color-ink)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-[4px_4px_0_var(--color-danger)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-chip border-[3px] border-ink bg-paper px-3.5 py-2.5 text-sm font-medium text-ink",
      "shadow-hard-xs transition-shadow placeholder:text-ink-soft/60 placeholder:font-normal",
      "focus-visible:outline-none focus-visible:shadow-[4px_4px_0_var(--color-ink)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-[4px_4px_0_var(--color-danger)]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function InputPrefix({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-brutal absolute left-0 top-0 flex h-full items-center border-r-[3px] border-ink bg-butter px-3",
        className,
      )}
    >
      {children}
    </span>
  );
}
