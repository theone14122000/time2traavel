"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Clock,
  Copy,
  ExternalLink,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { EmailText } from "@/components/about/email-text";
import {
  formatPhoneDisplay,
  mailtoHref,
  telHref,
  toE164,
  waHref,
} from "@/lib/contact";
import { cn } from "@/lib/utils";

const MapEmbed = dynamic(
  () => import("@/components/shared/map-embed").then((module) => module.MapEmbed),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[320px] w-full border border-line bg-paper shadow-brutal-lg sm:h-[420px]"
      />
    ),
  },
);

export type ContactBlockProps = {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  supportPhone: string | null;
  address: string;
  workingHours: string | null;
  mapEmbedUrl: string;
};

function ContactCard({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col border border-line bg-paper p-5 shadow-brutal-md",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center border border-line bg-lemon"
        >
          {icon}
        </span>
        <p className="label-brutal text-ink-soft">{label}</p>
      </div>
      <div className="mt-4 flex flex-col items-start gap-3">{children}</div>
    </div>
  );
}

function CopyButton({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to your clipboard");
    } catch {
      toast.error("Could not copy — please select the text instead.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="label-brutal tap-44 inline-flex h-11 w-fit items-center gap-2 border border-line bg-butter px-3 transition-colors hover:bg-lemon"
    >
      <Copy aria-hidden="true" className="size-4" />
      Copy {children}
    </button>
  );
}

function DirectionsLink({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "label-brutal tap-44 inline-flex h-11 items-center gap-2 border border-line bg-butter px-3 transition-colors hover:bg-lemon",
        className,
      )}
    >
      Get Directions
      <ExternalLink aria-hidden="true" className="size-4" />
    </a>
  );
}

export function ContactBlock({
  phone,
  whatsapp,
  email,
  supportPhone,
  address,
  workingHours,
  mapEmbedUrl,
}: ContactBlockProps) {
  const phoneDisplay = formatPhoneDisplay(phone);
  const phoneTel = telHref(phone);
  const phoneCopy = toE164(phone);
  const whatsappUrl = waHref(
    whatsapp,
    "Hello Time to Travel, I would like to plan a trip.",
  );
  const emailHref = mailtoHref(email);
  const supportDisplay = formatPhoneDisplay(supportPhone);
  const supportTel = telHref(supportPhone);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-6">
        {phoneDisplay && phoneTel ? (
          <ContactCard icon={<Phone aria-hidden="true" className="size-5" />} label="Call">
            <a
              href={phoneTel}
              className="tap-44 inline-flex min-h-11 items-center font-display text-h4 uppercase underline-offset-4 hover:underline"
            >
              {phoneDisplay}
            </a>
            {phoneCopy ? <CopyButton value={phoneCopy}>number</CopyButton> : null}
          </ContactCard>
        ) : null}

        {whatsappUrl ? (
          <ContactCard
            icon={<MessageCircle aria-hidden="true" className="size-5" />}
            label="WhatsApp"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-44 inline-flex min-h-11 items-center gap-2 font-display text-h4 uppercase underline-offset-4 hover:underline"
            >
              Chat on WhatsApp
            </a>
          </ContactCard>
        ) : null}

        {email && emailHref ? (
          <ContactCard icon={<Mail aria-hidden="true" className="size-5" />} label="Email">
            <a
              href={emailHref}
              className="tap-44 inline-flex min-h-11 items-center break-all text-sm font-bold underline-offset-4 hover:underline"
            >
              <EmailText address={email} />
            </a>
            <CopyButton value={email}>email address</CopyButton>
          </ContactCard>
        ) : null}

        <ContactCard icon={<MapPin aria-hidden="true" className="size-5" />} label="Visit us">
          <p className="text-sm font-semibold leading-relaxed">{address}</p>
          <DirectionsLink url={directionsUrl} />
        </ContactCard>

        {workingHours ? (
          <ContactCard
            icon={<Clock aria-hidden="true" className="size-5" />}
            label="Working hours"
          >
            <p className="text-sm font-semibold leading-relaxed">{workingHours}</p>
          </ContactCard>
        ) : null}

        {supportDisplay && supportTel ? (
          <ContactCard
            icon={<Headphones aria-hidden="true" className="size-5" />}
            label={"Website & I.T support"}
            className="p-4 sm:col-span-2"
          >
            <a
              href={supportTel}
              className="tap-44 inline-flex min-h-11 items-center text-base font-bold underline-offset-4 hover:underline"
            >
              {supportDisplay}
            </a>
            <p className="text-xs font-medium leading-relaxed text-ink-soft">
              For website or technical issues only. For trip enquiries, please use
              the numbers above.
            </p>
          </ContactCard>
        ) : null}
      </div>

      <div className="lg:col-span-6">
        <div className="border border-line bg-paper p-5 shadow-brutal-lg sm:p-7">
          <ContactForm
            heading="Send us a message"
            submitLabel="Send Enquiry"
            successMessage="Message received — we'll get back to you shortly."
            successTitle="Message received"
            whatsappUrl={whatsappUrl ?? undefined}
          />
        </div>

        <div className="mt-6 border border-line bg-paper p-4 shadow-brutal-lg">
          <p className="label-brutal text-ink-soft">Find our office</p>
          <div className="mt-3">
            <MapEmbed src={mapEmbedUrl} className="border shadow-brutal-lg" />
          </div>
          <div className="mt-4 border border-dashed border-line bg-butter p-4">
            <p className="text-sm font-semibold leading-relaxed">{address}</p>
            <DirectionsLink url={directionsUrl} className="mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
