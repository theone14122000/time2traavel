"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid gap-2.5", className)}
    {...props}
  />
));
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "size-5 shrink-0 rounded-full border border-line bg-paper shadow-hard-xs transition-all",
      "hover:bg-butter focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink",
      "data-[state=checked]:shadow-none data-[state=checked]:ring-[3px] data-[state=checked]:ring-ink data-[state=checked]:ring-offset-2 data-[state=checked]:ring-offset-paper data-[state=checked]:bg-lemon",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
RadioGroupItem.displayName = "RadioGroupItem";
