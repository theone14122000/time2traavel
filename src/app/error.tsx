"use client";

import { Button } from "@/components/ui/button";

/**
 * Root-level error boundary. Copy stays generic on purpose — no stack traces,
 * no request details, nothing that could leak internals to a visitor.
 */
export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-paper p-4">
      <div className="w-full max-w-lg border-[4px] border-ink bg-peach p-6 text-center shadow-hard-xl sm:p-8">
        <p className="label-brutal text-ink">Error</p>

        <h1 className="mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">
          Something broke
        </h1>

        <p className="mt-4 font-medium leading-relaxed">
          The page hit a snag while loading. Nothing to worry about — try again, or head back
          home.
        </p>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button type="button" size="lg" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            {/* Full reload is deliberate: an error boundary must not depend on the router. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Back to home</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
