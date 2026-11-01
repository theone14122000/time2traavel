"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Thin reading-progress rail pinned to the very top of the viewport.
 * Purely decorative (aria-hidden) — page scroll position is already exposed by
 * the browser, and the bar simply disappears for reduced-motion users.
 *
 * It renders only after mount. `useReducedMotion()` is false on the server but
 * can already be true on the client's first render; branching on it during
 * hydration produced a markup mismatch (React error #418) that left the whole
 * page non-interactive for every visitor with "reduce animations" switched on.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1.5 origin-left border-b border-line bg-tomato"
    />
  );
}
