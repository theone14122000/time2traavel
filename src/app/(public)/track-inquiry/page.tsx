import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Compass, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { TrackInquiryForm } from "./track-inquiry-form";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Track Your Enquiry",
    description:
      "Check the status of an enquiry submitted to Time to Travel using your reference id and the phone or email you used.",
    path: "/track-inquiry",
    noIndex: true,
  });
}

const STEPS: { title: string; body: string }[] = [
  {
    title: "Find your reference id",
    body: "It's in the confirmation you received when the enquiry was submitted (something like TTT-2026-0001).",
  },
  {
    title: "Add one contact detail",
    body: "Enter either the phone number or the email you used — both must match the enquiry.",
  },
  {
    title: "See the status",
    body: "You'll see the current status, enquiry type and submission date. We never show names or messages here.",
  },
];

export default async function TrackInquiryPage() {
  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Enquiry" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Track enquiry"
        title="Where's my enquiry?"
        description="Enter your reference id plus the phone or email you used. We only show the status — never your personal details."
        tone="sky"
      >
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/about-us#contact">
          <Mail aria-hidden="true" className="size-4" />
          Contact us
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="track-form-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2">
              <ClipboardList aria-hidden="true" className="size-3.5" />
              How it works
            </span>
            <h2
              id="track-form-heading"
              className="mt-5 max-w-[16ch] text-h2"
            >
              Three quick steps
            </h2>

            <ol className="mt-6 grid gap-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 border-4 border-ink bg-paper p-4 shadow-brutal-md"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center border-[3px] border-ink bg-lemon font-display text-base"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-display text-base uppercase leading-snug">{step.title}</p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              className={`${buttonVariants({ variant: "outline", size: "md" })} mt-6`}
              href="/plan-my-trip"
            >
              <Compass aria-hidden="true" className="size-4" />
              Start a new trip plan
            </Link>
          </div>

          <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md sm:p-6">
            <TrackInquiryForm />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
