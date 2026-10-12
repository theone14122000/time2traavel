import type { ReactNode } from "react";
import { MapPin, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { getContactDetails } from "@/lib/data/site";
import { Reveal } from "@/components/shared/reveal";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { HighlightedTitle } from "@/components/home/highlight-title";
import { Stamp } from "@/components/ui/badge";

/**
 * Final CTA band: big headline + general enquiry form, with contact details
 * shown only when they are configured in Site Settings.
 */
export async function FinalCta() {
  const { settings, hasPhone, hasEmail, hasWhatsApp, whatsappUrl, phoneHref, emailHref } =
    await getContactDetails();

  const contactItems = [
    hasPhone && phoneHref
      ? { key: "phone", icon: <Phone aria-hidden="true" className="size-4" />, label: settings.phone, href: phoneHref }
      : null,
    hasEmail && emailHref
      ? { key: "email", icon: <Mail aria-hidden="true" className="size-4" />, label: settings.email, href: emailHref }
      : null,
    hasWhatsApp && whatsappUrl
      ? { key: "whatsapp", icon: <MessageCircle aria-hidden="true" className="size-4" />, label: "Chat on WhatsApp", href: whatsappUrl }
      : null,
  ].filter(Boolean) as { key: string; icon: ReactNode; label: string; href: string }[];

  return (
    <section
      id="enquire"
      aria-labelledby="enquire-heading"
      className="relative w-full clip-x border-b-[3px] border-ink bg-ink text-cream"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-40" />
      <span
        aria-hidden="true"
        className="absolute -left-8 bottom-10 hidden size-40 rotate-6 border-[3px] border-ink bg-tomato lg:block"
      />
      <span
        aria-hidden="true"
        className="absolute -right-10 top-8 hidden size-28 -rotate-12 border-[3px] border-ink bg-lemon lg:block"
      />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <div className="relative">
              <HomeSectionHeading
                id="enquire-heading"
                eyebrow="Let's go"
                tone="ink"
                title={<HighlightedTitle text="The world won't explore itself!" />}
                description="Your next unforgettable story could begin with one simple decision. Tell us where you're dreaming of — we'll help plan the rest."
              />
              <Stamp
                rotate={9}
                variant="tomato"
                className="absolute right-0 top-0 hidden sm:inline-flex"
              >
                Shimla-based
              </Stamp>
            </div>

            <div className="mt-7 border-4 border-ink bg-paper p-5 text-ink shadow-brutal-md">
              <p className="label-brutal text-ink-soft">Time2Travel</p>
              <p className="mt-3 flex items-start gap-2 text-sm font-semibold">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {settings.address}
              </p>

              {contactItems.length > 0 ? (
                <ul className="mt-4 grid gap-2">
                  {contactItems.map((item) => (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noreferrer noopener" : undefined}
                        className="press tap-44 flex items-center gap-2 border-[3px] border-ink bg-mint px-3 py-2 text-sm font-bold shadow-brutal-sm"
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm font-medium text-ink-soft">
                  Contact details will appear here once they&apos;re configured.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-4 border-ink bg-paper p-5 text-ink shadow-brutal-lg sm:p-7">
              <ContactForm
                heading="Send a message"
                submitLabel="Let's go exploring"
                successMessage="Message received — we'll get back to you shortly."
                whatsappUrl={whatsappUrl}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
