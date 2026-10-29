import type { Metadata } from "next";
import Link from "next/link";
import { Compass, WifiOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { buttonVariants } from "@/components/ui/button-variants";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "You're offline",
    description: "You appear to be offline. Reconnect to keep browsing Time to Travel.",
    path: "/offline",
    noIndex: true,
  });
}

const TIPS: { title: string; body: string }[] = [
  {
    title: "Check your connection",
    body: "Switch Wi-Fi or mobile data and reload — most pages come straight back.",
  },
  {
    title: "Saved items stay put",
    body: "Your wishlist lives on this device, so it's still there once you're back online.",
  },
  {
    title: "Try again in a bit",
    body: "If you're on a train or in the hills, signal often returns after a few minutes.",
  },
];

export default async function OfflinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Offline"
        title="You're offline"
        description="It looks like the network dropped. We can't load live trip data right now — reconnect and try again."
        tone="cream"
      >
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/">
          <Compass aria-hidden="true" className="size-4" />
          Back home
        </Link>
      </PageHeader>

      <SectionWrapper tone="cream" bordered gridLines containerClassName="py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <div className="flex flex-col items-start gap-4 border border-line bg-paper p-6 shadow-brutal-md">
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center border border-line bg-butter"
            >
              <WifiOff className="size-6" />
            </span>
            <p className="font-display text-h3 uppercase leading-tight">Hang tight</p>
            <p className="text-sm font-medium leading-relaxed text-ink-soft">
              This page renders without the database so you always have somewhere to land.
              Everything else needs a connection.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-3">
            {TIPS.map((tip) => (
              <li key={tip.title} className="border border-line bg-paper p-5 shadow-brutal-md">
                <h2 className="font-display text-h4 uppercase leading-tight">{tip.title}</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
                  {tip.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={buttonVariants({ variant: "default", size: "lg" })} href="/">
            Try again
          </Link>
          <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/saved">
            View saved items
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
