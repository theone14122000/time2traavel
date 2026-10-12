import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { Stamp } from "@/components/ui/badge";
import {
  BrutalCard,
  BrutalCardBody,
  BrutalCardMedia,
} from "@/components/ui/brutal-card";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { cn } from "@/lib/utils";

type InternationalDestination = {
  id: string;
  slug: string;
  name: string;
  state: string;
  country: string | null;
  summary: string | null;
  image: string | null;
  imageAlt: string | null;
};

/**
 * International destinations band — bento grid of published destinations
 * flagged `isInternational`. Cards link to the destination detail page and
 * fall back to the brutalist poster when no image is uploaded yet.
 */
export async function InternationalTrips() {
  const destinations = await safeQuery<InternationalDestination[]>(
    "home.international",
    () =>
      prisma.destination.findMany({
        where: { published: true, isInternational: true },
        select: {
          id: true,
          slug: true,
          name: true,
          state: true,
          country: true,
          summary: true,
          image: true,
          imageAlt: true,
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        take: 8,
      }),
    [],
  );

  return (
    <section
      id="international"
      aria-labelledby="international-heading"
      className="relative w-full border-y-[3px] border-ink bg-sky"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(var(--color-ink) 1.5px, transparent 2px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="international-heading"
            eyebrow="No borders"
            title="Your next chapter has no borders!"
            panelWords={2}
            panelTone="sky"
            description="Discover exciting destinations, different cultures, and journeys that take you beyond the familiar."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/destinations/international">
              <Globe2 aria-hidden="true" className="size-4" />
              View all
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {destinations.length === 0 ? (
            <EmptyState
              eyebrow="International"
              title="International trips coming soon"
              description="We haven't published any international destinations yet — tell us where you'd like to go and we'll plan it with you."
              tone="sky"
              illustration="map"
              className="py-8 sm:py-10"
              action={
                <Button asChild variant="default" size="md">
                  <Link href="/plan-my-trip">Plan a custom trip</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination, index) => (
                <article
                  key={destination.id}
                  className={cn(
                    "h-full",
                    index === 0 && destinations.length > 1 && "sm:col-span-2",
                  )}
                >
                  <BrutalCard
                    variant="destination"
                    className="flex h-full flex-col"
                    badge={
                      <Stamp variant="soft" rotate={6}>
                        {destination.country?.trim() || "International"}
                      </Stamp>
                    }
                  >
                    <BrutalCardMedia
                      aspect={index === 0 && destinations.length > 1 ? "wide" : "destination"}
                    >
                      <BrutalImage
                        src={destination.image}
                        alt={destination.imageAlt?.trim() || destination.name}
                        aspect="free"
                        className="h-full w-full border-0"
                        sizes={
                          index === 0 && destinations.length > 1
                            ? "(max-width: 1024px) 92vw, 62vw"
                            : "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                        }
                      />
                    </BrutalCardMedia>

                    <BrutalCardBody className="flex flex-1 flex-col gap-3 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="label-brutal border-[2px] border-ink bg-paper px-2 py-1">
                          {destination.state}
                        </span>
                      </div>

                      <h3 className="font-display text-h3 uppercase leading-none">
                        {destination.name}
                      </h3>

                      {destination.summary ? (
                        <p className="line-clamp-3 text-sm font-medium leading-relaxed text-ink-soft">
                          {destination.summary}
                        </p>
                      ) : null}

                      <div className="mt-auto pt-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="tap-44 w-full sm:w-auto"
                        >
                          <Link href={`/destinations/${destination.slug}`}>
                            Explore
                            <ArrowRight aria-hidden="true" className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </BrutalCardBody>
                  </BrutalCard>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
