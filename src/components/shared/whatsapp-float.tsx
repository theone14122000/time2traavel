"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type WhatsappFloatProps = {
  /** Raw number from Site Settings; hidden when empty. */
  number?: string | null;
  className?: string;
};

/**
 * Floating WhatsApp shortcut (bottom-left). lucide ships no WhatsApp brand
 * glyph, so the chat-bubble icon stands in. The number comes from Site
 * Settings via the (public) layout; non-digits are stripped for the wa.me
 * link and a leading 0 is left as configured (wa.me resolves local formats).
 * Sits at z-40 — below dialogs/command palette (z-50).
 */
export function WhatsappFloat({ number, className }: WhatsappFloatProps) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "press tap-44 fixed bottom-24 left-4 z-40 flex size-12 items-center justify-center border-4 border-ink bg-mint text-ink shadow-hard-lg sm:bottom-6",
        className,
      )}
    >
      <MessageCircle aria-hidden="true" className="size-6" strokeWidth={2.5} />
    </a>
  );
}
