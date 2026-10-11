import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrutalImage } from "@/components/ui/brutal-image";
import { buttonVariants } from "@/components/ui/button-variants";
import { getPublishedServices, type ServiceCard } from "@/lib/data/services";
import { cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Services",
    description:
      "Travel services from Time to Travel — visas, stays, transport, custom planning and more. Open a service for process steps and FAQs.",
    path: "/services",
  });
}

const COLOR_CLASSES: Record<string, string> = {
  lemon: "bg-lemon",
  butter: "bg-butter",
  mint: "bg-mint",
  sky: "bg-sky",
  peach: "bg-peach",
  lavender: "bg-lavender",
  blush: "bg-blush",
  sand: "bg-sand",
};

function serviceAccent(color: string | null): string {
  if (!color) return "bg-butter";
  return COLOR_CLASSES[color.toLowerCase()] ?? "bg-butter";
}

function ServiceCardTile({ service }: { service: ServiceCard }) {
  return (
    <article className="flex h-full flex-col border-4 border-ink bg-paper shadow-brutal-md transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg">
      <div className={cn("relative border-b-[3px] border-ink", serviceAccent(service.color))}>
        <BrutalImage
          src={service.coverImage}
          alt={service.coverImageAlt || service.title}
          aspect="wide"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
        />
        {service.icon ? (
          <span className="absolute left-3 top-3 flex size-10 items-center justify-center border-[3px] border-ink bg-paper font-display text-lg shadow-hard-xs">
            {service.icon}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="font-display text-h4 uppercase leading-tight">{service.title}</h2>
        {service.shortDescription ? (
          <p className="text-sm font-medium leading-relaxed text-ink-soft">
            {service.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            href={`/services/${service.slug}`}
          >
            View service
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Services"
        title="What we handle for you"
        description="Every service below is published by our team. Open one to see how it works, what it covers, and how to ask about it."
        tone="peach"
      >
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/plan-my-trip">
          <Compass aria-hidden="true" className="size-4" />
          Plan my trip
        </Link>
        <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/contact">
          <Mail aria-hidden="true" className="size-4" />
          Contact us
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="services-grid-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <h2 id="services-grid-heading" className="sr-only">
          Published services
        </h2>

        {services.length === 0 ? (
          <EmptyState
            eyebrow="Services"
            title="Services coming soon"
            description="We haven't published any services yet. Tell us what you need help with and we'll take it from there."
            tone="peach"
            illustration="map"
            action={
              <Link className={buttonVariants({ variant: "default", size: "md" })} href="/contact">
                Contact us
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCardTile key={service.id} service={service} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
