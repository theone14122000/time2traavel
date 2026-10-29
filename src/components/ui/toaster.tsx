"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Brutalist toast stack: thick black border + hard offset shadow.
 * `unstyled` disables sonner's default look so our classes fully own it.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      offset={{ top: 16, bottom: 96 }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full items-start gap-3 border border-line bg-cream px-4 py-3 text-ink shadow-hard pointer-events-auto",
          title: "font-display text-sm uppercase tracking-wide",
          description: "text-sm font-medium text-ink-soft",
          content: "flex flex-col gap-1",
          actionButton:
            "border border-line bg-lemon px-3 py-1 text-xs font-bold uppercase",
          cancelButton:
            "border border-line bg-paper px-3 py-1 text-xs font-bold uppercase",
          success:
            "border-l-[10px] border-l-success bg-mint",
          error: "border-l-[10px] border-l-danger bg-pink",
          warning: "border-l-[10px] border-l-warning bg-butter",
          info: "border-l-[10px] border-l-line bg-sky",
        },
      }}
      {...props}
    />
  );
}
