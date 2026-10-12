"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { popIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Cookie consent banner — consent UX only.
 *
 * Stores the visitor's choice in `localStorage` under `tt:cookie-consent`
 * ("all" | "essential") and hides once a choice exists. This component does
 * NOT load any analytics/marketing scripts; when real analytics are added,
 * gate them on the stored choice.
 *
 * Mounted once in the root layout so every route (public + admin) is covered.
 * Fixed above the mobile action bar on small screens; focusable buttons live
 * inside a labelled region. Nothing renders on the server or before the
 * stored choice has been read (no hydration mismatch).
 */

const STORAGE_KEY = "tt:cookie-consent";

type ConsentChoice = "all" | "essential";

function readChoice(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "all" || raw === "essential" ? raw : null;
  } catch {
    return null; // storage unavailable — ask again next visit
  }
}

const buttonClass =
  "tap-44 label-brutal inline-flex items-center justify-center border-[3px] border-cream px-4 py-3 text-ink transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1";

export function CookieConsent() {
  const reduceMotion = useReducedMotion();
  const [choice, setChoice] = React.useState<ConsentChoice | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setChoice(readChoice());
    setReady(true);
  }, []);

  const accept = (value: ConsentChoice) => {
    setChoice(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private mode / quota — the banner simply reappears next visit.
    }
  };

  return (
    <AnimatePresence>
      {ready && choice === null ? (
        <motion.div
          key="cookie-consent"
          data-cookie-banner=""
          role="region"
          aria-label="Cookie consent"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : "hidden"}
          variants={popIn}
          className={cn(
            "fixed bottom-24 left-4 right-4 z-40 border-4 border-ink bg-ink p-4 text-cream shadow-hard-xl sm:bottom-6 sm:left-24 sm:right-6 sm:max-w-3xl",
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium leading-relaxed">
              We use essential cookies for the site to work and optional analytics
              cookies to understand usage.
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => accept("all")}
                className={cn(buttonClass, "bg-lemon")}
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => accept("essential")}
                className={cn(buttonClass, "bg-paper")}
              >
                Essential only
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
