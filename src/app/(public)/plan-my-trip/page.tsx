import type { Metadata } from "next";
import Link from "next/link";
import { ShieldQuestion, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { TripPlannerStandalone } from "@/components/forms/trip-planner-standalone";
import { getPublishedTripTypes } from "@/lib/data/trip-types";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Plan My Trip",
    description:
      "Tell us where you want to go, when, and roughly how many of you are travelling. We'll come back with a plan built around your dates and budget.",
    path: "/plan-my-trip",
  });
}

const PROMISES: { title: string; body: string }[] = [
  {
    title: "A real reply",
    body: "A person from our team reads your plan request and replies using the contact details you share.",
  },
  {
    title: "Built around your dates",
    body: "Share your window (even if it's flexible) and we'll work with it.",
  },
  {
    title: "No obligation",
    body: "Asking for a plan doesn't commit you to booking anything.",
  },
];

export default async function PlanMyTripPage() {
  const tripTypes = await getPublishedTripTypes();
  const tripTypeNames = tripTypes.map((tripType) => tripType.name);

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plan My Trip" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Plan my trip"
        title="Let's build your trip"
        description="Four quick steps — where you're headed, when, how many of you, and how to reach you. Drafts save on this device as you go."
        tone="butter"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/contact">
          <ShieldQuestion aria-hidden="true" className="size-4" />
          Prefer to just ask?
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="plan-form-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            <h2 id="plan-form-heading" className="sr-only">
              Trip planning form
            </h2>
            <TripPlannerStandalone tripTypes={tripTypeNames} />
          </div>

          <aside className="grid content-start gap-6">
            <div className="border-4 border-ink bg-mint p-5 shadow-brutal-md">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center border-[3px] border-ink bg-paper"
                >
                  <Sparkles className="size-4" />
                </span>
                <h3 className="font-display text-h4 uppercase">What happens next</h3>
              </div>
              <ul className="mt-4 grid gap-3">
                {PROMISES.map((promise) => (
                  <li key={promise.title} className="border-[3px] border-ink bg-paper p-3">
                    <p className="font-bold leading-snug">{promise.title}</p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-ink-soft">
                      {promise.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
              <h3 className="font-display text-h4 uppercase">In a hurry?</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
                You can also message us on WhatsApp from the contact page, or send a simple
                contact-form note instead.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                  href="/contact"
                >
                  Contact page
                </Link>
                <Link
                  className={buttonVariants({ variant: "soft", size: "sm" })}
                  href="/faqs"
                >
                  FAQs
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      <SectionWrapper tone="butter" bordered aria-labelledby="plan-how-heading">
        <div className="py-10">
          <SectionHeading
            id="plan-how-heading"
            eyebrow="Good to know"
            title="How planning works here"
            description="Your answers stay in this browser until you send them. Once submitted, the request lands in our enquiry queue with a reference id you can track."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={buttonVariants({ variant: "outline", size: "md" })} href="/track-inquiry">
              Track an existing enquiry
            </Link>
            <Link className={buttonVariants({ variant: "outline", size: "md" })} href="/reviews">
              Read traveller reviews
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
