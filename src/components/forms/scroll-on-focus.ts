"use client";

import * as React from "react";

/**
 * Keeps a focused field visible above the on-screen keyboard on mobile by
 * scrolling it to the centre of the viewport. Instant when the user prefers
 * reduced motion; no-op during SSR.
 *
 * Attach to inputs / textareas / select triggers only — never to wrappers.
 */
export function scrollFieldIntoViewOnFocus(
  event: React.FocusEvent<HTMLElement>,
): void {
  if (typeof window === "undefined") return;
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  event.currentTarget.scrollIntoView({
    block: "center",
    behavior: reduceMotion ? "auto" : "smooth",
  });
}
