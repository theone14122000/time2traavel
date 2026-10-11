"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { tiltOnHover } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type BrutalCardVariant = "destination" | "package" | "review" | "info";

const base =
  "relative border-[3px] border-ink bg-paper shadow-hard text-left";

const variantClasses: Record<BrutalCardVariant, string> = {
  destination: "hover:shadow-hard-lg transition-shadow duration-200",
  package: "shadow-brutal-md",
  review: "bg-paper",
  info: "border-4",
};

/**
 * Accent tint for the review variant — butter wash on the paper base.
 * Kept as a semi-transparent overlay so the paper border language stays intact.
 */
const reviewAccent = "before:absolute before:inset-0 before:z-0 before:pointer-events-none before:bg-butter/30";

export interface BrutalCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onAnimationStart" | "onDragEnd" | "onDragEnter" | "onDragExit" | "onDragLeave" | "onDragOver" | "onDragStart" | "onDrop"> {
  /** Visual preset that tweaks border/shadow/hover treatment. */
  variant?: BrutalCardVariant;
  /** Absolutely positioned sticker (top-left, slightly rotated). */
  sticker?: React.ReactNode;
  /** Absolutely positioned badge (top-right corner). */
  badge?: React.ReactNode;
  /** Disable the tilt/lift hover animation (also auto-disabled for reduced motion / coarse pointers). */
  disableHover?: boolean;
}

const CARD_CONTENT_CLASS = "relative z-[1]";
const SLOTS = ["header", "media", "body", "footer"] as const;

/**
 * Neo-brutalistic card shell. Compose with `BrutalCardHeader/Media/Body/Footer`.
 *
 * @example
 * <BrutalCard variant="destination" sticker={<Stamp>Popular</Stamp>} badge={<Badge>₹42,000</Badge>}>
 *   <BrutalCardMedia aspect="landscape">
 *     <BrutalImage src={destination.imageUrl} alt={destination.name} />
 *   </BrutalCardMedia>
 *   <BrutalCardBody>
 *     <h3 className="text-h4 font-display uppercase">{destination.name}</h3>
 *   </BrutalCardBody>
 * </BrutalCard>
 */
export function BrutalCard({
  variant = "destination",
  sticker,
  badge,
  disableHover = false,
  className,
  children,
  ...props
}: BrutalCardProps) {
  const reduceMotion = useReducedMotion();
  const [canHover, setCanHover] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const interactive = !disableHover && !reduceMotion && canHover;

  return (
    <motion.div
      className={cn(base, variantClasses[variant], variant === "review" && reviewAccent, className)}
      initial="rest"
      animate="rest"
      whileHover={interactive ? "hover" : undefined}
      variants={tiltOnHover}
      {...props}
    >
      {sticker ? (
        <span
          className="absolute -left-3 -top-3 z-[2] pointer-events-none"
          style={{ rotate: "-6deg" }}
        >
          {sticker}
        </span>
      ) : null}
      {badge ? (
        <span className="absolute right-2 top-2 z-[2]">{badge}</span>
      ) : null}
      {children}
    </motion.div>
  );
}

/** Card top section — title/meta row. */
export function BrutalCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot={SLOTS[0]}
      className={cn(CARD_CONTENT_CLASS, "flex items-start justify-between gap-3 px-4 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface BrutalCardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio of the media box. Defaults to `landscape`. */
  aspect?: "square" | "portrait" | "landscape" | "wide";
}

const mediaAspect: Record<NonNullable<BrutalCardMediaProps["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[3/2]",
  wide: "aspect-[16/9]",
};

/** Aspect-ratio media frame for images. */
export function BrutalCardMedia({
  aspect = "landscape",
  className,
  children,
  ...props
}: BrutalCardMediaProps) {
  return (
    <div
      data-slot={SLOTS[1]}
      className={cn(
        CARD_CONTENT_CLASS,
        "relative w-full overflow-hidden border-b-[3px] border-ink",
        mediaAspect[aspect],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card body — padded text content area. */
export function BrutalCardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot={SLOTS[2]}
      className={cn(CARD_CONTENT_CLASS, "space-y-2 px-4 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card footer — actions / meta strip, separated by a hard border. */
export function BrutalCardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot={SLOTS[3]}
      className={cn(
        CARD_CONTENT_CLASS,
        "flex flex-wrap items-center justify-between gap-2 border-t-[3px] border-ink px-4 py-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
