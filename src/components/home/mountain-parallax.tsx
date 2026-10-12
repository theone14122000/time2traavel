"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Decorative layered mountain silhouettes for the mountains band.
 * Lightweight scroll parallax; fully disabled under reduced motion.
 */
export function MountainParallax() {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const farY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -28]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -16]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -8]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* stars */}
      <span className="absolute left-[12%] top-[14%] size-1.5 rounded-full bg-lemon/70" />
      <span className="absolute left-[28%] top-[8%] size-1 rounded-full bg-cream/60" />
      <span className="absolute left-[64%] top-[12%] size-1.5 rounded-full bg-lemon/50" />
      <span className="absolute left-[82%] top-[20%] size-1 rounded-full bg-cream/50" />

      <motion.div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{ y: farY }}
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 220 L180 100 L320 200 L520 60 L720 190 L940 80 L1140 200 L1320 110 L1440 210 L1440 320 L0 320 Z"
            fill="#1f1f1f"
            stroke="#0a0a0a"
            strokeWidth="3"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 h-[55%]"
        style={{ y: midY }}
      >
        <svg
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 200 L220 90 L420 180 L640 70 L860 190 L1080 100 L1280 190 L1440 120 L1440 280 L0 280 Z"
            fill="var(--tt-mint-strong)"
            opacity="0.35"
            stroke="rgba(255 255 255 / 0.15)"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 h-[35%]"
        style={{ y: nearY }}
      >
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 160 L260 70 L520 150 L800 60 L1080 150 L1440 80 L1440 200 L0 200 Z"
            fill="#0a0a0a"
          />
        </svg>
      </motion.div>
    </div>
  );
}
