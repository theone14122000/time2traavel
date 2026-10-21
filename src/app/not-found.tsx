import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { GradientWord } from "@/components/ui/gradient-word";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Root-level 404. Renders under the root layout only (no site chrome, no
 * TripPlannerProvider) — keep it fully self-contained.
 */
export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-cream px-4 py-20 text-center"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
      <span
        aria-hidden="true"
        className="absolute -left-10 -top-10 hidden size-40 rotate-12 border-[3px] border-ink bg-lemon sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-10 -right-10 hidden size-40 -rotate-6 border-[3px] border-ink bg-sky sm:block"
      />

      <div className="relative flex w-full max-w-2xl flex-col items-center gap-5">
        <p className="label-brutal border-[3px] border-ink bg-ink px-3 py-2 text-cream">
          Error 404
        </p>

        <h1 id="not-found-heading" className="max-w-[16ch] text-h1 text-ink">
          404 / Page not <GradientWord tone="ink">found</GradientWord>
        </h1>

        <EmptyState
          className="w-full"
          tone="butter"
          illustration="map"
          eyebrow="Off the map"
          title="This page isn't on our itinerary"
          description="The page you're looking for doesn't exist or has moved. Let's get you back on track."
          action={
            <>
              <Link
                href="/"
                className={buttonVariants({ variant: "default", size: "lg" })}
              >
                Home
              </Link>
              <Link
                href="/destinations"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Destinations
              </Link>
              <Link
                href="/packages"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Packages
              </Link>
              <Link
                href="/about-us#contact"
                className={buttonVariants({ variant: "dark", size: "lg" })}
              >
                Contact
              </Link>
            </>
          }
        />
      </div>
    </section>
  );
}
