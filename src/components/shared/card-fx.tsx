"use client";

import * as React from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Pointer-driven depth for every card on the site, with ONE delegated listener.
 *
 * Any element carrying the `.card-shine` class (all CardSurface cards, destination
 * cards, trip-type tiles, gallery tiles…) gets, while a mouse hovers it:
 *   --rx / --ry   a gentle 3D tilt that follows the cursor
 *   --px / --py   the cursor position (-1…1), used for image parallax
 * The CSS in globals.css turns those into motion. Nothing runs for touch input,
 * and no per-card React state exists. Visitors who prefer reduced motion still get
 * the effect, at half the tilt (it is small, slow and cursor-driven, never autonomous).
 */
const MAX_TILT = 5; // degrees
const MAX_TILT_REDUCED = 2.5;

export function CardFx() {
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const maxTilt = reduceMotion ? MAX_TILT_REDUCED : MAX_TILT;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let active: HTMLElement | null = null;
    let frame = 0;
    let pending: PointerEvent | null = null;

    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };

    const update = () => {
      frame = 0;
      const e = pending;
      pending = null;
      if (!e) return;
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".card-shine") ?? null;
      if (card !== active) {
        reset(active);
        active = card;
      }
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.setProperty("--ry", `${(px * maxTilt).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-py * maxTilt).toFixed(2)}deg`);
      card.style.setProperty("--px", px.toFixed(3));
      card.style.setProperty("--py", py.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pending = e;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeaveWindow = () => {
      reset(active);
      active = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      if (frame) cancelAnimationFrame(frame);
      reset(active);
    };
  }, [reduceMotion]);

  return null;
}
