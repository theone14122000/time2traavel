"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { popIn } from "@/lib/motion";

const REVEAL_AFTER_PX = 600;

/**
 * Square lemon "back to top" button. Sits above the mobile action bar on small
 * screens and reveals itself only after real scrolling, so it never competes
 * with the hero.
 */
export function BackToTop() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > REVEAL_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="Back to top"
          onClick={scrollToTop}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : "hidden"}
          variants={popIn}
          className="fixed bottom-24 right-4 z-30 flex size-12 items-center justify-center border-[3px] border-ink bg-lemon shadow-hard transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none sm:bottom-6"
        >
          <ArrowUp aria-hidden="true" className="size-5" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
