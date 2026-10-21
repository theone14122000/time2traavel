import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { CardSurface as Card, CardCaption, CardMedia } from "@/components/ui/card";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { cn } from "@/lib/utils";
import { getInternationalFallbacks } from "@/lib/home-fallback-images";

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
            title="Your next chapter has no [[borders]]!"
            gradientTone="ocean"
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
            /* Local photo showcase — real international photos from
               public/images when no CMS destinations are published yet. */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {getInternationalFallbacks().map((img, index) => (
                <article
                  key={img.src}
                  className={cn(
                    "h-full",
                    index === 0 && "sm:col-span-2",
                  )}
                >
                  <Card variant="media" accent="sky" as="article">
                    <CardMedia aspect={index === 0 ? "16/10" : "4/5"}>
                      <BrutalImage
                        src={img.src}
                        alt={img.alt}
                        aspect="free"
                        className="h-full w-full border-0"
                        sizes={
                          index === 0
                            ? "(max-width: 1024px) 92vw, 62vw"
                            : "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                        }
                      />
                    </CardMedia>
                    <CardCaption
                      title={img.caption}
                      badge={
                        <span className="label-brutal border-[2px] border-ink bg-sky px-2 py-1 text-ink">
                          {img.regionLabel}
                        </span>
                      }
                    />
                  </Card>
                </article>
              ))}
            </div>
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
                  <Card variant="media" accent="sky" as="article">
                    <CardMedia
                      aspect={index === 0 && destinations.length > 1 ? "16/10" : "4/5"}
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
                    </CardMedia>

                    <CardCaption
                      title={destination.name}
                      tagline={destination.summary ?? undefined}
                      badge={
                        <span className="label-brutal border-[2px] border-ink bg-sky px-2 py-1 text-ink">
                          {destination.country?.trim() || "International"}
                        </span>
                      }
                    />
                  </Card>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
