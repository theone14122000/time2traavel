"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { EASE, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    title: "Tell us your plan",
    description:
      "Share your destination, dates, travellers and budget — as much or as little as you know.",
  },
  {
    title: "Get a custom itinerary",
    description:
      "We put together an itinerary with the places, stays and travel time spelled out.",
  },
  {
    title: "Confirm and prepare",
    description:
      "Once you're happy with the plan, we confirm the bookings and share what to carry.",
  },
  {
    title: "Travel and relax",
    description: "You travel — we stay reachable for changes along the way.",
  },
];

const CONNECTOR_PATH =
  "M0 20 Q 75 0 150 20 T 300 20 T 450 20 T 600 20 T 750 20 T 900 20 T 1050 20 T 1200 20";

export function PlanSteps() {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <div className="relative mt-10">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="absolute left-0 top-7 hidden h-10 w-full lg:block"
      >
        <motion.path
          d={CONNECTOR_PATH}
          fill="none"
          stroke="var(--tt-ink)"
          strokeWidth={4}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
          whileInView={{ pathLength: 1 }}
          viewport={viewportOnce}
          transition={{ duration: animate ? 1.2 : 0, ease: EASE }}
        />
      </svg>

      <StaggerGroup
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        staggerDelay={0.12}
      >
        {STEPS.map((step, index) => (
          <StaggerItem key={step.title} className="h-full">
            <div className="flex h-full flex-col border-[3px] border-ink bg-paper p-5 shadow-hard">
              <span
                aria-hidden="true"
                className="relative z-[1] flex size-14 items-center justify-center border-[3px] border-ink bg-lemon font-display text-xl leading-none shadow-brutal-sm"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-4 font-display text-h4 uppercase leading-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
                {step.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
