"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex w-full flex-wrap items-stretch gap-0 border-[3px] border-ink bg-paper p-1 shadow-hard-xs",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 border-[2px] border-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
      "hover:border-ink hover:bg-butter",
      "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink",
      "data-[state=active]:border-ink data-[state=active]:bg-lemon data-[state=active]:shadow-hard-xs",
      "whitespace-nowrap",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-0",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
