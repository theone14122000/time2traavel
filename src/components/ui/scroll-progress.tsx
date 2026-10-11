"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Thin brutalist reading-progress rail pinned to the very top of the viewport.
 * Purely decorative (aria-hidden) — page scroll position is already exposed by
 * the browser, and the bar simply disappears for reduced-motion users.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1.5 origin-left border-b-[2px] border-ink bg-tomato"
    />
  );
}
