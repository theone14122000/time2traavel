"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HomeSectionHeading } from "@/components/home/section-heading";
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
    description:
      "You travel — we stay reachable for changes along the way.",
  },
];

/**
 * Process band — four fixed, neutral steps from enquiry to travel.
 * The connector line draws itself once when the section scrolls into view
 * (disabled for reduced-motion users).
 */
export function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative w-full border-y-[3px] border-ink bg-mint"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <HomeSectionHeading
          id="how-it-works-heading"
          eyebrow="How it works"
          title="How it works"
          description="The same four steps whether you're booking a weekend break or a multi-stop trip."
        />

        <div className="relative mt-10">
          {animate ? (
            <motion.span
              aria-hidden="true"
              className="absolute left-0 right-0 top-7 hidden h-[4px] origin-left bg-ink lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.9, ease: EASE }}
            />
          ) : (
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-7 hidden h-[4px] bg-ink lg:block"
            />
          )}

          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.12}>
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
      </div>
    </section>
  );
}
