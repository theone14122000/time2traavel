import * as React from "react";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { MapEmbed } from "@/components/shared/map-embed";
import { Reveal } from "@/components/shared/reveal";
import { RevealTitle } from "@/components/shared/motion";
import { ContactForm } from "@/components/forms/contact-form";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionDivider } from "@/components/ui/dividers";
import { BrutalCard } from "@/components/ui/brutal-card";
import { Button } from "@/components/ui/button";
import { getContactDetails } from "@/lib/data/site";
import { getPublishedFaqs } from "@/lib/data/reviews";
import { buildBreadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { SITE_IDENTITY } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Contact Us",
    description: `Get in touch with ${SITE_IDENTITY.name} — travel agency based in ${SITE_IDENTITY.address}.`,
    path: "/contact",
    noIndex: false,
  });
}

type Channel = {
  key: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external: boolean;
};

export default async function ContactPage() {
  const [contact, faqs] = await Promise.all([
    getContactDetails(),
    getPublishedFaqs(),
  ]);

  const { settings, hasPhone, hasEmail, hasWhatsApp, whatsappUrl, phoneHref, emailHref, mapEmbedUrl } =
    contact;

  const channels: Channel[] = [];
  if (hasPhone && phoneHref && settings.phone) {
    channels.push({
      key: "phone",
      icon: <Phone aria-hidden="true" className="size-4 shrink-0" />,
      label: "Phone",
      value: settings.phone,
      href: phoneHref,
      external: false,
    });
  }
  if (hasEmail && emailHref && settings.email) {
    channels.push({
      key: "email",
      icon: <Mail aria-hidden="true" className="size-4 shrink-0" />,
      label: "Email",
      value: settings.email,
      href: emailHref,
      external: false,
    });
  }
  if (hasWhatsApp && whatsappUrl) {
    channels.push({
      key: "whatsapp",
      icon: <MessageCircle aria-hidden="true" className="size-4 shrink-0" />,
      label: "WhatsApp",
      value: "Chat on WhatsApp",
      href: whatsappUrl,
      external: true,
    });
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description="Send an enquiry below, or reach us directly — whichever suits you. We reply as soon as we can."
      />

      <SectionWrapper tone="cream" bordered gridLines aria-labelledby="contact-details-heading">
        <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              id="contact-details-heading"
              eyebrow="Reach us"
              title={
                <RevealTitle as="span" className="block">
                  Contact details
                </RevealTitle>
              }
              description="Phone, email and WhatsApp appear here only once they're configured."
            />

            {channels.length > 0 ? (
              <ul className="mt-8 grid max-w-xl gap-4">
                {channels.map((channel) => (
                  <li key={channel.key}>
                    <BrutalCard variant="info" disableHover className="bg-paper">
                      <a
                        href={channel.href}
                        target={channel.external ? "_blank" : undefined}
                        rel={channel.external ? "noreferrer noopener" : undefined}
                        className="tap-44 flex w-full items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-butter focus-visible:bg-butter"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center border-[2px] border-ink bg-lemon"
                        >
                          {channel.icon}
                        </span>
                        <span className="sr-only">{channel.label}: </span>
                        <span className="min-w-0 break-words">{channel.value}</span>
                        <span aria-hidden="true" className="ml-auto shrink-0 font-display text-base">
                          →
                        </span>
                      </a>
                    </BrutalCard>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 max-w-xl">
                <EmptyState
                  eyebrow="Not configured yet"
                  title="Direct contact details coming soon"
                  description="Phone, email and WhatsApp will appear here once they're set in Site Settings — or just use the enquiry form."
                  tone="sky"
                  illustration="search"
                  icon={<Send className="size-8" aria-hidden="true" />}
                />
              </div>
            )}

            <div className="mt-6 grid max-w-xl gap-4">
              <BrutalCard variant="info" disableHover className="bg-paper">
                <div className="px-4 py-4">
                  <p className="label-brutal text-ink-soft">Office address</p>
                  <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-relaxed">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {settings.address}
                  </p>
                </div>
              </BrutalCard>
              {settings.workingHours ? (
                <BrutalCard variant="info" disableHover className="bg-paper">
                  <div className="px-4 py-4">
                    <p className="label-brutal text-ink-soft">Working hours</p>
                    <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-relaxed">
                      <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      {settings.workingHours}
                    </p>
                  </div>
                </BrutalCard>
              ) : null}
            </div>

            <div className="mt-8 max-w-xl">
              <MapEmbed src={mapEmbedUrl} className="shadow-brutal-lg" />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div
              id="contact-form"
              className="scroll-mt-24 border-4 border-ink bg-paper p-5 shadow-brutal-lg sm:p-7"
            >
              <ContactForm
                heading="Send us a message"
                submitLabel="Send Enquiry"
                successMessage="Message received — we'll get back to you shortly."
                whatsappUrl={whatsappUrl}
              />
            </div>
          </Reveal>
        </div>
      </SectionWrapper>

      <SectionDivider variant="stripe" tone="lemon" />

      <SectionWrapper tone="lavender" bordered aria-labelledby="contact-faq-heading">
        <div className="py-12 sm:py-16 lg:py-20">
          <SectionHeading
            id="contact-faq-heading"
            eyebrow="FAQs"
            title={
              <RevealTitle as="span" className="block">
                Common questions
              </RevealTitle>
            }
          />
          <div className="mt-8 max-w-3xl">
            {faqs.length === 0 ? (
              <EmptyState
                eyebrow="Nothing published yet"
                title="FAQs are being prepared"
                description="Published questions and answers will appear here. Got one right now? Send it through the form above."
                tone="paper"
                illustration="luggage"
                icon={<Send className="size-8" aria-hidden="true" />}
                action={
                  <Button asChild variant="dark" size="md">
                    <a href="#contact-form">Ask us anything</a>
                  </Button>
                }
              />
            ) : (
              <Accordion
                type="single"
                collapsible
                defaultValue={faqs[0].id}
                className="grid gap-4"
              >
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="whitespace-pre-wrap">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </SectionWrapper>

      <SectionDivider variant="zigzag" tone="ink" />

      <SectionWrapper tone="ink" bordered gridLines aria-labelledby="contact-newsletter-heading">
        <div className="grid gap-6 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <span className="label-brutal w-fit border-[3px] border-ink bg-lemon px-3 py-2 text-ink">
              Newsletter
            </span>
            <h2
              id="contact-newsletter-heading"
              className="mt-4 max-w-[18ch] font-display text-h2 uppercase"
            >
              Stay in the loop
            </h2>
            <p className="mt-3 max-w-xl text-lead font-medium text-butter">
              Occasional travel ideas and updates from {SITE_IDENTITY.name}. Unsubscribe
              anytime.
            </p>
          </div>
          <NewsletterForm tone="dark" className="lg:justify-self-end lg:max-w-md" />
        </div>
      </SectionWrapper>

      <JsonLd data={breadcrumb} />
    </>
  );
}
