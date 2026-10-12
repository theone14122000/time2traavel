import { HomeSectionHeading } from "@/components/home/section-heading";
import { getPublishedFaqs } from "@/lib/data/reviews";
import { FaqView } from "@/components/home/faq-view";

export async function FaqSection() {
  const faqs = await getPublishedFaqs();

  return (
    <section
      id="faqs"
      aria-labelledby="faq-heading"
      className="relative w-full border-y-[3px] border-ink bg-mint"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <HomeSectionHeading
          id="faq-heading"
          eyebrow="Ask away"
          title="Questions, answered."
          description="Published by our team from the admin panel — search below or jump straight to a question."
        />

        <div className="mt-8">
          <FaqView faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
