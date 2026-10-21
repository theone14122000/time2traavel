import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Base neo-brutalist card surface: thick border + hard offset shadow. */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative border-[3px] border-ink bg-paper shadow-hard",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 border-b-[3px] border-ink p-4 sm:p-5", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-lg leading-tight sm:text-xl", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-ink-soft", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-t-[3px] border-ink p-4 sm:p-5",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Home-page card variants                                           *
 * ------------------------------------------------------------------ */

export type CardVariant = "media" | "info" | "quote" | "empty";
export type CardAccent = "lemon" | "tomato" | "mint" | "sky" | "paper" | "butter";

const accentFill: Record<CardAccent, string> = {
  lemon: "bg-lemon",
  tomato: "bg-tomato",
  mint: "bg-mint",
  sky: "bg-sky",
  paper: "bg-paper",
  butter: "bg-butter",
};

/**
 * The one card anatomy for the home sections.
 *
 * Variants:
 *  - `media`  photo-led cards (destinations, international, packages) whose
 *             caption panel overlaps the image bottom;
 *  - `info`   text cards (how it works, services, why us) with a numbered
 *             or icon badge and a faint halftone texture;
 *  - `quote`  speech-bubble cards for reviews and stories;
 *  - `empty`  compact blank-state card.
 *
 * Every variant shares the same chrome: 3px ink border, 6px hard offset
 * shadow that grows to 10px on hover, 0-6px radius and the 16/20/24
 * spacing scale.
 */
export function CardSurface({
  children,
  variant = "info",
  accent = "lemon",
  className,
  disableHover = false,
  as: Component = "div",
}: {
  children: React.ReactNode;
  variant?: CardVariant;
  accent?: CardAccent;
  className?: string;
  disableHover?: boolean;
  as?: "div" | "article" | "li" | "figure";
}) {
  return (
    <Component
      className={cn(
        "group relative flex h-full flex-col border-[3px] border-ink bg-paper",
        variant === "quote" ? "rounded-[6px]" : "rounded-sm",
        "shadow-hard transition-[transform,box-shadow] duration-200",
        // Hover lift only where a real pointer exists; motion-reduce kills it.
        !disableHover &&
          "[@media(hover:hover)]:hover:-translate-x-0.5 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-hard-lg",
        "motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0",
        variant === "info" && "overflow-hidden",
        className,
      )}
    >
      {children}
    </Component>
  );
}

/** Image well: fills the card, clipped, with an inner 2px ink keyline. */
export function CardMedia({
  children,
  className,
  aspect = "4/5",
}: {
  children: React.ReactNode;
  className?: string;
  aspect?: "4/5" | "16/10" | "1/1";
}) {
  const aspectClass =
    aspect === "16/10"
      ? "aspect-[16/10]"
      : aspect === "1/1"
        ? "aspect-square"
        : "aspect-[4/5]";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-butter",
        aspectClass,
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6px] border-2 border-ink/80"
      />
    </div>
  );
}

/** Caption panel that overlaps the media bottom edge. */
export function CardCaption({
  title,
  tagline,
  badge,
  accent = "lemon",
  className,
  children,
}: {
  title: React.ReactNode;
  tagline?: React.ReactNode;
  /** Small category badge, top-left of the media. */
  badge?: React.ReactNode;
  accent?: CardAccent;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      {badge ? <span className="absolute left-3 top-3 z-20">{badge}</span> : null}
      <div
        className={cn(
          "relative z-10 -mt-8 border-[3px] border-ink bg-paper p-4 sm:p-5",
          className,
        )}
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                "font-display text-[1.5rem] uppercase leading-none sm:text-[1.75rem]",
                accent === "tomato" ? "text-ink" : "text-ink",
              )}
            >
              {title}
            </h3>
            {tagline ? (
              <p className="mt-1.5 line-clamp-2 text-[0.9375rem] font-medium leading-snug text-ink-soft">
                {tagline}
              </p>
            ) : null}
          </div>
          <CardArrow accent={accent} />
        </div>
        {children}
      </div>
    </>
  );
}

/** Round arrow button — fills coral and nudges on hover. */
export function CardArrow({
  accent = "tomato",
  className,
}: {
  accent?: CardAccent;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink transition-colors duration-200",
        accentFill[accent],
        "group-hover:bg-tomato",
        className,
      )}
    >
      <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" />
    </span>
  );
}

/** Numbered or icon badge in a bordered square. */
export function CardBadge({
  children,
  accent = "lemon",
  className,
}: {
  children: React.ReactNode;
  accent?: CardAccent;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-14 shrink-0 items-center justify-center border-[3px] border-ink font-display text-xl leading-none shadow-brutal-sm",
        accentFill[accent],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Body padding for info cards. */
export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative z-[1] flex flex-1 flex-col p-5", className)}>
      {children}
    </div>
  );
}

/** Faint halftone texture used behind info cards. */
export function CardTexture({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-[0.04] dots-field",
        className,
      )}
    />
  );
}
