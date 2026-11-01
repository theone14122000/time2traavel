"use client";

import * as React from "react";
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Hydration-safe `prefers-reduced-motion`.
 *
 * framer-motion's own hook is `false` while rendering on the server but is
 * already `true` on the client's very first render for visitors who switched
 * animations off. Any component that renders different markup based on it
 * therefore mismatched the server HTML (React error #418), which broke hydration
 * for the whole page. This wrapper reports `false` until the component has
 * mounted, so server and first client render always agree, then switches to the
 * real preference.
 */
export function useReducedMotion(): boolean {
  const preferred = useFramerReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted && Boolean(preferred);
}
