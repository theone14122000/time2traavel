import Link from "next/link";
import { ArrowRight, CalendarHeart } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { BRUTAL_ICONS, DEFAULT_BRUTAL_ICON } from "@/components/home/icon-map";
import { Stamp } from "@/components/ui/badge";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { getPublishedTripTypes, type TripTypeCard } from "@/lib/data/trip-types";
import { cn } from "@/lib/utils";

const FALLBACK_TONES = [
  "bg-mint",
  "bg-sky",
  "bg-peach",
  "bg-lavender",
  "bg-blush",
  "bg-sand",
  "bg-paper",
];

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Trip types band — image-led cards for every published trip type.
 * Each card links to the trip-type page, the pre-filtered packages list and
 * the trip planner with the trip type pre-selected.
 */
export async function TripTypesSection() {
  const tripTypes = await getPublishedTripTypes();

  if (tripTypes.length === 0) return null;

  return (
    <section
      id="trip-types"
      aria-labelledby="trip-types-heading"
      className="relative w-full border-y-[3px] border-ink bg-lavender"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="trip-types-heading"
            eyebrow="Choose your next quest"
            title="Pick your next [[adventure]]!"
            gradientTone="flame"
            description="Mountain trails, peaceful valleys, international escapes, and unforgettable road trips. Your next story starts here."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/packages">
              All packages
              <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tripTypes.map((tripType, index) => (
            <TripTypeTile key={tripType.id} tripType={tripType} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TripTypeTile({
  tripType,
  index,
}: {
  tripType: TripTypeCard;
  index: number;
}) {
  const Icon =
    BRUTAL_ICONS[tripType.icon?.trim() ?? ""] ?? DEFAULT_BRUTAL_ICON;
  const color = tripType.color?.trim();
  const usesHex = Boolean(color && isHexColor(color));
  const fallbackTone = FALLBACK_TONES[index % FALLBACK_TONES.length];

  return (
    <li className="h-full">
      <article className="relative flex h-full flex-col border-[3px] border-ink bg-paper shadow-hard transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg">
        <div
          className={cn(
            "relative aspect-[3/2] overflow-hidden border-b-[3px] border-ink",
            !usesHex && fallbackTone,
          )}
          style={usesHex ? { backgroundColor: color as string } : undefined}
        >
          {tripType.coverImage ? (
            <BrutalImage
              src={tripType.coverImage}
              alt={tripType.coverImageAlt?.trim() || tripType.name}
              aspect="free"
              zoom
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Icon aria-hidden="true" className="size-16 text-ink" strokeWidth={2} />
            </div>
          )}

          <span className="absolute left-3 top-3 z-[2]">
            <Stamp rotate={-6} variant="tomato">
              {tripType.name}
            </Stamp>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <h3 className="font-display text-h4 uppercase leading-tight">{tripType.name}</h3>

          {tripType.description ? (
            <p className="line-clamp-3 text-sm font-medium leading-relaxed text-ink-soft">
              {tripType.description}
            </p>
          ) : null}

          <div className="mt-auto flex flex-col gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/trip-types/${tripType.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "tap-44 flex-1",
                )}
              >
                View
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={`/packages?tripType=${tripType.slug}`}
                className={cn(
                  buttonVariants({ variant: "soft", size: "sm" }),
                  "tap-44 flex-1",
                )}
              >
                Packages
              </Link>
            </div>

            <Link
              href={`/plan-my-trip?tripType=${tripType.slug}`}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "tap-44 w-full",
              )}
            >
              <CalendarHeart aria-hidden="true" className="size-4" />
              Plan this trip
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}
