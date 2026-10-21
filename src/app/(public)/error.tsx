"use client";

import { Button } from "@/components/ui/button";
import { GradientWord } from "@/components/ui/gradient-word";

type PublicPageError = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Page-level error boundary for every (public) route. Copy stays generic on
 * purpose — no stack traces, no request details, nothing that could leak
 * internals to a visitor.
 */
export default function PublicError({ reset }: PublicPageError) {
  return (
    <main className="flex min-h-[60vh] w-full items-center justify-center bg-paper p-4">
      <div className="w-full max-w-xl border-4 border-ink bg-peach p-6 text-center shadow-brutal-lg sm:p-8">
        <p className="label-brutal text-ink">Page error</p>

        <h1 className="mt-3 text-h2">
          Something <GradientWord tone="ink">broke</GradientWord>
        </h1>

        <p className="mt-4 font-medium leading-relaxed">
          This page ran into a problem while loading. Nothing is lost — try it once more, or
          head back to the homepage.
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
