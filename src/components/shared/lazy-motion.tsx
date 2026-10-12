"use client";

import * as React from "react";
import { LazyMotion, domAnimation } from "framer-motion";

/**
 * App-wide LazyMotion boundary (domAnimation: transform/opacity/clip-path
 * animations + hover/tap/scroll gestures — no layout/drag features needed).
 * `m.*` components inside this tree get the smaller feature bundle;
 * existing `motion.*` usage keeps working unchanged.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict={false}>{children}</LazyMotion>;
}
