import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Luggage, Mail, PlaneTakeoff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button-variants";
import { Checklists } from "./checklists";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Travel Essentials",
    description:
      "Packing checklists and pre-departure reminders — documents, clothing, electronics and health kit. Tick items off as you pack; your ticks stay on this device.",
    path: "/travel-essentials",
  });
}

const CHECKLISTS: {
  title: string;
  description: string | null;
  items: { id: string; label: string }[];
}[] = [
  {
    title: "Documents & money",
    description: "The papers you'll regret leaving behind.",
    items: [
      { id: "doc-ticket", label: "Flight / train tickets (or e-tickets on your phone)" },
      { id: "doc-id", label: "Government photo ID for every traveller" },
      { id: "doc-passport", label: "Passport (validity checked) for international trips" },
      { id: "doc-visa", label: "Visa or entry authorisation, if required" },
      { id: "doc-copies", label: "Photocopies / cloud backups of the key documents" },
      { id: "doc-cards", label: "Debit / credit cards + a little cash" },
      { id: "doc-insurance", label: "Travel insurance details, if you've bought a policy" },
      { id: "doc-hotel", label: "Hotel or stay confirmations" },
    ],
  },
  {
    title: "Clothing & packing",
    description: "Match the season and the itinerary — layers win.",
    items: [
      { id: "clothes-daily", label: "Everyday outfits, one per planned day (plus a spare)" },
      { id: "clothes-under", label: "Underwear and socks, one per day" },
      { id: "clothes-sleep", label: "Sleepwear" },
      { id: "clothes-layer", label: "A warm layer for evenings or higher altitudes" },
      { id: "clothes-rain", label: "Rain jacket or compact umbrella" },
      { id: "clothes-shoes", label: "Comfortable walking shoes + one spare pair" },
      { id: "clothes-swim", label: "Swimwear, if your stay has a pool or beach" },
      { id: "clothes-bag", label: "A foldable day bag for outings" },
    ],
  },
  {
    title: "Electronics",
    description: "Charge everything the night before.",
    items: [
      { id: "elec-phone", label: "Phone + charger" },
      { id: "elec-powerbank", label: "Power bank (carry-in luggage only)" },
      { id: "elec-adapter", label: "Plug adapter for the destination" },
      { id: "elec-headphones", label: "Headphones" },
      { id: "elec-cam", label: "Camera + memory cards, if you shoot photos" },
      { id: "elec-ids", label: "ID photos on your phone for permits or check-ins" },
    ],
  },
  {
    title: "Health & toiletries",
    description: "Small kit, big difference.",
    items: [
      { id: "health-meds", label: "Personal medicines for the full trip + a few extra days" },
      { id: "health-basic", label: "Basic kit: band-aids, antiseptic, pain relief" },
      { id: "health-sun", label: "Sunscreen and lip balm" },
      { id: "health-insect", label: "Insect repellent" },
      { id: "health-tooth", label: "Toothbrush, toothpaste, floss" },
      { id: "health-deo", label: "Deodorant and any daily toiletries" },
      { id: "health-wet", label: "Wet wipes and hand sanitiser" },
    ],
  },
];

const REMINDERS: { title: string; body: string }[] = [
  {
    title: "Confirm the practical stuff",
    body: "Re-check pickup times, hotel addresses and any pre-paid services a day or two before you leave.",
  },
  {
    title: "Download offline copies",
    body: "Save your itinerary, hotel confirmations and a map of the area for when signal is weak.",
  },
  {
    title: "Share your plan",
    body: "Send your itinerary to someone at home, including emergency contacts.",
  },
  {
    title: "Check the weather last-minute",
    body: "Mountain and coastal weather shifts quickly — glance at the forecast and adjust layers.",
  },
];

export default async function TravelEssentialsPage() {
  return (
    <>
      <div className="w-full border-b border-line bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Travel Essentials" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Travel Essentials"
        title="Pack once, forget nothing"
        description="Interactive packing checklists and pre-departure reminders. Your ticks are saved on this device only — nothing is sent anywhere."
        tone="mint"
      >
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/plan-my-trip">
          <Compass aria-hidden="true" className="size-4" />
          Plan my trip
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/packages">
          <PlaneTakeoff aria-hidden="true" className="size-4" />
          Browse packages
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="essentials-checklists-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="essentials-checklists-heading"
          eyebrow="Checklists"
          title="Tick as you pack"
          description="General-purpose lists for most India and nearby trips. Adjust to your destination's season and your own kit."
        />

        <div className="mt-8">
          <Checklists lists={CHECKLISTS} />
        </div>
      </SectionWrapper>

      <SectionWrapper
        tone="butter"
        bordered
        aria-labelledby="essentials-reminders-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="essentials-reminders-heading"
          eyebrow="Before you go"
          title="Four quick reminders"
        />

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {REMINDERS.map((reminder) => (
            <li
              key={reminder.title}
              className="border border-line bg-paper p-5 shadow-brutal-md"
            >
              <h3 className="font-display text-h4 uppercase leading-tight">{reminder.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
                {reminder.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={buttonVariants({ variant: "default", size: "lg" })} href="/plan-my-trip">
            <Luggage aria-hidden="true" className="size-4" />
            Start planning
          </Link>
          <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/about-us#contact">
            <Mail aria-hidden="true" className="size-4" />
            Ask a question
          </Link>
        </div>
      </SectionWrapper>
    </>
  );
}
