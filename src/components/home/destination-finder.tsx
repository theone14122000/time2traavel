import { HomeSectionHeading } from "@/components/home/section-heading";
import { FinderForm } from "@/components/home/finder-form";
import { getPublishedTripTypes } from "@/lib/data/trip-types";

/**
 * Destination finder band — server shell that hands the published trip types
 * to the client form. Matches come from the `findMatchesAction` server action.
 */
export async function DestinationFinder() {
  const tripTypes = await getPublishedTripTypes();

  return (
    <section
      id="trip-finder"
      aria-labelledby="trip-finder-heading"
      className="relative w-full border-y-[3px] border-ink bg-lavender"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <HomeSectionHeading
          id="trip-finder-heading"
          eyebrow="Trip finder"
          title="Find [[trips]] that fit"
          gradientTone="ocean"
          description="Filter our published destinations and packages by month, trip type and budget band."
        />

        <div className="mt-8">
          <FinderForm
            tripTypes={tripTypes.map(({ slug, name }) => ({ slug, name }))}
          />
        </div>
      </div>
    </section>
  );
}
