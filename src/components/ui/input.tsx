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
      "flex h-12 w-full rounded-chip border border-line bg-paper px-3.5 py-2 text-base font-medium text-ink",
      "shadow-hard-xs transition-shadow placeholder:text-ink-soft/60 placeholder:font-normal",
      "focus-visible:outline-none focus-visible:shadow-hard",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-hard",
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
      "flex min-h-28 w-full rounded-chip border border-line bg-paper px-3.5 py-2.5 text-base font-medium text-ink",
      "shadow-hard-xs transition-shadow placeholder:text-ink-soft/60 placeholder:font-normal",
      "focus-visible:outline-none focus-visible:shadow-hard",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-hard",
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
        "label-brutal absolute left-0 top-0 flex h-full items-center border-r border-line bg-butter px-3",
        className,
      )}
    >
      {children}
    </span>
  );
}
