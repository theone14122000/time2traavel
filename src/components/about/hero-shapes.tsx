"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function HeroShapes() {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yCircle = useTransform(scrollYProgress, [0, 1], [-48, 72]);
  const ySquare = useTransform(scrollYProgress, [0, 1], [56, -56]);
  const yTriangle = useTransform(scrollYProgress, [0, 1], [-32, 48]);

  const parallax = (value: typeof yCircle) =>
    reduceMotion ? undefined : { y: value };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <motion.svg
        viewBox="0 0 100 100"
        style={parallax(yCircle)}
        className="absolute -right-8 top-6 size-28 sm:size-44"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="var(--tt-sky)"
          stroke="var(--tt-ink)"
          strokeWidth="4"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 100 100"
        style={parallax(ySquare)}
        className="absolute -left-6 bottom-8 size-16 rotate-12 sm:size-24"
      >
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          fill="var(--tt-mint)"
          stroke="var(--tt-ink)"
          strokeWidth="4"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 100 100"
        style={parallax(yTriangle)}
        className="absolute right-6 bottom-4 size-20 sm:size-28"
      >
        <polygon
          points="50,6 94,94 6,94"
          fill="var(--tt-tomato)"
          stroke="var(--tt-ink)"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  );
}
