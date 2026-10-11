"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { popIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  kind: "destination" | "package";
  id: string;
  className?: string;
};

const boxClass =
  "tap-44 inline-flex size-11 shrink-0 items-center justify-center border-[3px] border-ink";

/**
 * Heart toggle for the wishlist. Renders an inert placeholder until the
 * localStorage-backed store is ready, so server HTML and the first client
 * paint match exactly (no hydration mismatch on saved state).
 */
export function WishlistButton({ kind, id, className }: WishlistButtonProps) {
  const { hasDestination, hasPackage, toggleDestination, togglePackage, ready } =
    useWishlist();
  const reduceMotion = useReducedMotion();

  if (!ready) {
    return (
      <span aria-hidden="true" className={cn(boxClass, "bg-paper", className)}>
        <Heart aria-hidden="true" className="size-5 opacity-0" />
      </span>
    );
  }

  const saved = kind === "destination" ? hasDestination(id) : hasPackage(id);
  const label = saved
    ? `Remove ${kind} from wishlist`
    : `Save ${kind} to wishlist`;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() =>
        kind === "destination" ? toggleDestination(id) : togglePackage(id)
      }
      className={cn(
        boxClass,
        "shadow-hard-xs transition-colors duration-150",
        saved ? "bg-paper text-tomato" : "bg-paper text-ink hover:bg-lemon",
        className,
      )}
    >
      <motion.span
        key={saved ? "saved" : "idle"}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={popIn}
        className="flex"
      >
        <Heart
          aria-hidden="true"
          className={cn("size-5", saved && "fill-current")}
          strokeWidth={2.5}
        />
      </motion.span>
    </button>
  );
}
