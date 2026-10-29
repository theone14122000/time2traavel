import { Lightbulb } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { CardSurface as Card, CardBadge, CardBody, CardTexture } from "@/components/ui/card";
import { getWhyChooseItems } from "@/lib/data/site";

/**
 * "Why choose us" — 100% admin-managed content. No invented stats.
 */
export async function WhyChooseUs() {
  const stored = await getWhyChooseItems();
  // Until the team publishes its own reasons, show our service principles
  // (no statistics or claims — only how we work).
  const items =
    stored.length > 0
      ? stored
      : [
          { title: "Personal planning", description: "Every enquiry is read by a person who plans around your dates, pace and budget." },
          { title: "Adventure first", description: "From Himalayan treks to island escapes, we start from the experience you want." },
          { title: "Support throughout", description: "One point of contact from first enquiry to final itinerary." },
        ];

  return (
    <section
      id="why-us"
      aria-labelledby="why-us-heading"
      className="relative w-full border-y border-line bg-peach"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <HomeSectionHeading
          id="why-us-heading"
          eyebrow="Our approach"
          title="Why travel with [[Time2Travel]]"
          gradientTone="plum"
          description="Personalised planning, adventure-first experiences, and support from first enquiry to final itinerary."
        />

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              eyebrow="Managed from admin"
              title="Why choose us — coming soon"
              description="Our reasons to travel with Time to Travel will appear here once published."
              tone="lavender"
              illustration="luggage"
              icon={<Lightbulb className="size-8" aria-hidden="true" />}
            />
          ) : (
            <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <StaggerItem key={`${item.title}-${index}`} className="h-full">
                  <Card variant="info" accent="lemon" className="h-full">
                    <CardTexture />
                    <CardBody>
                      <CardBadge accent="lemon">
                        {String(index + 1).padStart(2, "0")}
                      </CardBadge>
                      <h3 className="mt-4 font-display text-h4 uppercase leading-tight">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-relaxed text-ink-soft">
                        {item.description}
                      </p>
                    </CardBody>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>
    </section>
  );
}
