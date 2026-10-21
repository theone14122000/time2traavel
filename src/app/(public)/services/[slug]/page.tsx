import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleHelp, ListChecks, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrutalImage } from "@/components/ui/brutal-image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button-variants";
import { ContactForm } from "@/components/forms/contact-form";
import {
  getServiceBySlug,
  parseLinkedPackageSlugs,
  parseProcessSteps,
  parseServiceFaqs,
} from "@/lib/data/services";
import { getPackagesBySlugs, type PackageCard as PackageCardData } from "@/lib/data/packages";
import { PackageGrid } from "@/components/packages/package-grid";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return buildMetadata({
      title: "Service not found",
      description: "This service could not be found.",
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: service.seoTitle ?? service.title,
    description:
      service.seoDescription ?? service.shortDescription ?? `Details for ${service.title}.`,
    path: `/services/${service.slug}`,
    image: service.coverImage,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const processSteps = parseProcessSteps(service.processSteps);
  const faqs = parseServiceFaqs(service.faqs);
  const linkedSlugs = parseLinkedPackageSlugs(service.linkedPackageSlugs);
  const linkedPackages: PackageCardData[] =
    linkedSlugs.length > 0 ? await getPackagesBySlugs(linkedSlugs) : [];

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.title, path: `/services/${service.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />

      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
          />
        </Container>
      </div>

      <PageHeader
        eyebrow="Service"
        title={service.title}
        description={service.shortDescription}
        tone="peach"
      >
        <a className={buttonVariants({ variant: "dark", size: "lg" })} href="#service-enquire">
          <Mail aria-hidden="true" className="size-4" />
          Enquire about this service
        </a>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/services">
          <ArrowLeft aria-hidden="true" className="size-4" />
          All services
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="service-overview-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            <h2 id="service-overview-heading" className="sr-only">
              Overview
            </h2>
            <BrutalImage
              src={service.coverImage}
              alt={service.coverImageAlt || service.title}
              aspect="wide"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {service.longDescription ? (
              <div className="brutal-prose mt-6 max-w-3xl whitespace-pre-line">
                {service.longDescription}
              </div>
            ) : (
              <p className="mt-6 max-w-3xl text-base font-medium leading-relaxed text-ink-soft">
                A detailed write-up for this service is on the way. Send an enquiry and
                we&apos;ll explain how it works for your trip.
              </p>
            )}
          </div>

          <aside className="grid content-start gap-6">
            {processSteps.length > 0 ? (
              <div className="border-4 border-ink bg-mint p-5 shadow-brutal-md">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center border-[3px] border-ink bg-paper"
                  >
                    <ListChecks className="size-4" />
                  </span>
                  <h3 className="font-display text-h4 uppercase">How it works</h3>
                </div>
                <ol className="mt-4 grid gap-3">
                  {processSteps.map((step, index) => (
                    <li key={`${step.title}-${index}`} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center border-[3px] border-ink bg-lemon font-display text-sm"
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold leading-snug">{step.title}</p>
                        {step.description ? (
                          <p className="mt-1 text-sm font-medium leading-relaxed text-ink-soft">
                            {step.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md">
              <h3 className="font-display text-h4 uppercase">Need this service?</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink-soft">
                Send a note with your trip details — we&apos;ll confirm what&apos;s possible
                and what it involves.
              </p>
              <a
                className={`${buttonVariants({ variant: "default", size: "md" })} mt-4 w-full`}
                href="#service-enquire"
              >
                Enquire now
              </a>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      {linkedPackages.length > 0 ? (
        <SectionWrapper
          tone="sky"
          bordered
          aria-labelledby="service-packages-heading"
          containerClassName="py-12 sm:py-16 lg:py-20"
        >
          <SectionHeading
            id="service-packages-heading"
            eyebrow="Packages"
            title="Packages with this service"
            description="Published packages linked to this service from our admin."
          />
          <div className="mt-8">
            <PackageGrid packages={linkedPackages} />
          </div>
        </SectionWrapper>
      ) : null}

      {faqs.length > 0 ? (
        <SectionWrapper
          tone="butter"
          bordered
          aria-labelledby="service-faqs-heading"
          containerClassName="py-12 sm:py-16 lg:py-20"
        >
          <SectionHeading
            id="service-faqs-heading"
            eyebrow="FAQs"
            title={`Questions about ${service.title}`}
          />
          <Accordion type="multiple" className="mt-8 grid max-w-3xl gap-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={`${faq.question}-${index}`} value={`${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionWrapper>
      ) : null}

      <section
        id="service-enquire"
        aria-labelledby="service-enquire-heading"
        className="relative w-full border-y-[3px] border-ink bg-peach"
      >
        <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
        <Container className="relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="label-brutal inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-lemon px-3 py-2">
                <CircleHelp aria-hidden="true" className="size-3.5" />
                Enquire
              </span>
              <h2
                id="service-enquire-heading"
                className="mt-5 max-w-[16ch] text-h2"
              >
                Ask about {service.title}
              </h2>
              <p className="mt-4 max-w-xl text-lead font-medium text-ink-soft">
                Tell us your dates and what you need — we&apos;ll reply with what&apos;s
                possible for this service.
              </p>
              <Link
                className={`${buttonVariants({ variant: "outline", size: "lg" })} mt-6`}
                href="/plan-my-trip"
              >
                Plan my trip instead
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md sm:p-6">
              <ContactForm
                heading={`Enquire: ${service.title}`}
                subject={`Service enquiry: ${service.title}`}
                inquiryType="SERVICE"
                defaultMessage={`Hi, I'd like to know more about your ${service.title} service.`}
                showHeading
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
