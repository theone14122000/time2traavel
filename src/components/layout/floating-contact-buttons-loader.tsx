"use client";

import dynamic from "next/dynamic";

/**
 * `ssr: false` is only legal inside a Client Component — Next.js refuses it
 * when the `dynamic()` call sits in a Server Component (the root layout
 * would otherwise fail to compile). This thin client wrapper owns that call,
 * so `src/app/layout.tsx` can still mount the floating contact buttons after
 * `<CookieConsent />` and have them exist in the browser only: no server
 * markup, no hydration pass, no layout shift before the pop-in.
 */
export const FloatingContactButtons = dynamic(
  () =>
    import("./floating-contact-buttons").then(
      (mod) => mod.FloatingContactButtons,
    ),
  { ssr: false },
);
