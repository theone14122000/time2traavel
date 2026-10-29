import Link from "next/link";
import { Building2, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamAvatar } from "@/components/about/team-avatar";
import { GradientWord } from "@/components/ui/gradient-word";
import { getSiteSettings } from "@/lib/data/site";
import { getFounder } from "@/lib/data/team";

/**
 * Founder band — factual company lines only (founder from the CMS, office
 * address from Site Settings). Hidden entirely until a founder is published.
 */
export async function FounderTeaser() {
  const [settings, founder] = await Promise.all([
    getSiteSettings(),
    getFounder(),
  ]);

  if (!founder) return null;

  const avatarAlt =
    founder.imageAlt?.trim() ||
    `Portrait of ${founder.name}, ${founder.role}`;

  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="relative w-full border-y border-line bg-ink text-cream"
    >
      <span
        aria-hidden="true"
        className="grid-lines absolute inset-0 opacity-15"
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <TeamAvatar
            src={founder.image ?? `/team/${founder.slug}.jpg`}
            alt={avatarAlt}
            sizes="160px"
            className="size-[160px] shrink-0"
          />

          <div className="max-w-2xl">
            <span className="label-brutal inline-flex w-fit items-center gap-2 border border-line bg-lemon px-3 py-2 text-ink">
              <Building2 aria-hidden="true" className="size-3.5" />
              About us
            </span>

            <h2
              id="founder-heading"
              className="mt-4 flex items-start gap-3 text-h2 text-cream"
            >
              <UserRound aria-hidden="true" className="mt-1 size-7 shrink-0 text-lemon" />
              Founded by <GradientWord tone="aurora">{founder.name}</GradientWord>
            </h2>

            <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-cream/80 sm:text-base">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lemon" />
              {settings.address}
            </p>
          </div>
        </div>

        <Button asChild variant="secondary" size="lg" className="shrink-0 self-start lg:self-auto">
          <Link href="/about-us#team">
            Meet the team
            <span aria-hidden="true">→</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
