"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Phone, PenLine } from "lucide-react";
import { telHref } from "@/lib/contact";
import { cn } from "@/lib/utils";

type MobileActionBarProps = {
  phone?: string | null;
  className?: string;
};

const REVEAL_PAST_PX = 80;
/** Minimum px the thumb must travel before the bar treats it as a direction change. */
const DIRECTION_THRESHOLD_PX = 4;

/**
 * Sticky bottom action bar for small screens: Call / Enquire. Buttons without
 * configured contact details are hidden automatically (the floating WhatsApp
 * and email buttons own messaging elsewhere).
 * Slides out of the way while scrolling down and returns on scroll up.
 */
export function MobileActionBar({ phone, className }: MobileActionBarProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    lastY.current = scrollY.get();
  }, [scrollY]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastY.current;
    lastY.current = latest;

    if (latest <= REVEAL_PAST_PX) {
      setHidden(false);
      return;
    }

    const delta = latest - previous;
    if (delta > DIRECTION_THRESHOLD_PX) setHidden(true);
    else if (delta < -DIRECTION_THRESHOLD_PX) setHidden(false);
  });

  const callUrl = telHref(phone);
  const columns = callUrl ? 2 : 1;
  const slideOut = !reduceMotion && hidden;

  return (
    <motion.div
      role="group"
      aria-label="Quick actions"
      aria-hidden={slideOut || undefined}
      inert={slideOut}
      animate={{ y: slideOut ? "115%" : "0%" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 320, damping: 34, mass: 0.6 }
      }
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t-[3px] border-ink bg-cream pb-[env(safe-area-inset-bottom)] lg:hidden",
        className,
      )}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {callUrl ? (
          <a
            href={callUrl}
            className="flex min-h-14 flex-col items-center justify-center gap-1 border-r-[3px] border-ink bg-paper px-2 py-2 text-center transition-colors active:bg-butter"
          >
            <Phone aria-hidden="true" className="size-5" />
            <span className="label-brutal text-[0.6rem]">Call</span>
          </a>
        ) : null}

        <Link
          href="/about-us#contact"
          className="flex min-h-14 flex-col items-center justify-center gap-1 bg-lemon px-2 py-2 text-center transition-colors active:bg-butter"
        >
          <PenLine aria-hidden="true" className="size-5" />
          <span className="label-brutal text-[0.6rem]">Enquire</span>
        </Link>
      </div>
    </motion.div>
  );
}
