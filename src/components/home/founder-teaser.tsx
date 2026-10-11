import Link from "next/link";
import { Building2, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data/site";
import { SITE_IDENTITY } from "@/lib/constants";

/**
 * Founder band — factual company lines only (founder name + office address
 * from Site Settings, falling back to the verified constants). No bio copy.
 */
export async function FounderTeaser() {
  const settings = await getSiteSettings();

  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="relative w-full border-y-[3px] border-ink bg-ink text-cream"
    >
      <span
        aria-hidden="true"
        className="grid-lines absolute inset-0 opacity-15"
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-14">
        <div className="max-w-2xl">
          <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2 text-ink">
            <Building2 aria-hidden="true" className="size-3.5" />
            About us
          </span>

          <h2
            id="founder-heading"
            className="mt-4 flex items-start gap-3 font-display text-h2 uppercase text-cream"
          >
            <UserRound aria-hidden="true" className="mt-1 size-7 shrink-0 text-lemon" />
            Founded and owned by {SITE_IDENTITY.founder}
          </h2>

          <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-cream/80 sm:text-base">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lemon" />
            {settings.address}
          </p>
        </div>

        <Button asChild variant="secondary" size="lg" className="shrink-0 self-start lg:self-auto">
          <Link href="/about">
            More about us
            <span aria-hidden="true">→</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
