import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { BRUTAL_ICONS, DEFAULT_BRUTAL_ICON } from "@/components/home/icon-map";
import { Button } from "@/components/ui/button";
import { CardTexture } from "@/components/ui/card";
import { getPublishedServices, type ServiceCard } from "@/lib/data/services";
import { cn } from "@/lib/utils";

const FALLBACK_TONES = [
  "bg-mint",
  "bg-sky",
  "bg-peach",
  "bg-lavender",
  "bg-blush",
  "bg-sand",
  "bg-paper",
  "bg-lemon",
];

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Services band — colour-block cards built from published services.
 * Icon names are whitelisted lucide icons (unknown names fall back to Map),
 * colours come from the database hex value or a rotating token palette.
 */
export async function ServicesSection() {
  const services = await getPublishedServices();

  if (services.length === 0) return null;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative w-full border-y border-line bg-sand"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="services-heading"
            eyebrow="Services"
            title="What we can [[book]] for you"
            gradientTone="forest"
            description="Published by our team from the admin panel — pick a service to see what's included."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/services">
              All services
              <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => (
            <ServiceTile key={service.id} service={service} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceTile({ service, index }: { service: ServiceCard; index: number }) {
  const Icon = BRUTAL_ICONS[service.icon?.trim() ?? ""] ?? DEFAULT_BRUTAL_ICON;
  const color = service.color?.trim();
  const usesHex = Boolean(color && isHexColor(color));

  return (
    <li className="h-full">
      <Link
        href="/services"
        className={cn(
          "group flex h-full flex-col gap-4 rounded-sm border border-line bg-paper p-5 shadow-hard",
          "transition-[transform,box-shadow,background-color] duration-150",
          "hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-hard-lg",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink",
        )}
      >
        <CardTexture />
        <span
          aria-hidden="true"
          className={cn(
            "relative z-[1] flex size-14 shrink-0 items-center justify-center border border-line shadow-brutal-sm",
            !usesHex && FALLBACK_TONES[index % FALLBACK_TONES.length],
          )}
          style={usesHex ? { backgroundColor: color as string } : undefined}
        >
          <Icon className="size-7" strokeWidth={2.5} />
        </span>

        <h3 className="relative z-[1] font-display text-h4 uppercase leading-tight">
          {service.title}
        </h3>

        {service.shortDescription ? (
          <p className="relative z-[1] text-sm font-medium leading-relaxed text-ink-soft">
            {service.shortDescription}
          </p>
        ) : null}

        <span className="label-brutal relative z-[1] mt-auto inline-flex items-center gap-1.5 pt-2 text-ink">
          View services
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </span>
      </Link>
    </li>
  );
}
