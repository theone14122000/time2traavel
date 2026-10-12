"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { EASE, DURATION, maskReveal, viewportOnce } from "@/lib/motion";
import { AnimatedHeading } from "@/components/ui/animated-heading";

/* ------------------------------------------------------------------ *
 * Magnetic wrapper — desktop pointers only, off for reduced motion.   *
 * ------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 10,
  className,
}: {
  children: React.ReactNode;
  /** Max translate distance in px. */
  strength?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const el = ref.current;
    if (!el) return;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.transform = `translate(${(x * strength).toFixed(1)}px, ${(y * strength).toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion, strength]);

  return (
    <span
      ref={ref}
      className={cn("inline-block transition-transform duration-200 will-change-transform", className)}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * CountUp — animates to a REAL database value when scrolled into view. *
 * Never pass invented numbers: only counts coming from the DB.        *
 * ------------------------------------------------------------------ */
export function CountUp({
  value,
  duration = 1.1,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion || value <= 0) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * RevealTitle — masked slide-up for section titles.                    *
 * String titles get the full <AnimatedHeading> treatment (word mask    *
 * reveal + palette highlight + hard shadow); rich node titles keep the *
 * container-level mask.                                                *
 * ------------------------------------------------------------------ */
export function RevealTitle({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  onDark = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "h1" | "h2" | "h3";
  /** Cream hard-shadow for titles on ink backgrounds. */
  onDark?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (typeof children === "string") {
    return (
      <AnimatedHeading
        as={Tag}
        text={children}
        variant="section"
        delay={delay}
        onDark={onDark}
        animate={!reduceMotion}
        className={className}
      />
    );
  }

  if (reduceMotion) {
    const Static = Tag;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag className={cn("overflow-hidden", className)}>
      <motion.span
        className="block"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={maskReveal}
        transition={{ duration: DURATION.base, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * RouteWipe — bold colored wipe between page transitions.             *
 * Mount once in the (public) layout; remounts on pathname change.     *
 * ------------------------------------------------------------------ */
export function RouteWipe({ tone = "bg-tomato" }: { tone?: string }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const firstLoad = React.useRef(true);
  const [session, setSession] = React.useState(0);

  React.useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setSession((s) => s + 1);
  }, [pathname]);

  if (reduceMotion || session === 0) return null;

  return (
    <span
      key={session}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[999] animate-wipe will-change-transform",
        tone,
      )}
    />
  );
}
