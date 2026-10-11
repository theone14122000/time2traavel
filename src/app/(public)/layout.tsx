import * as React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { WhatsappFloat } from "@/components/shared/whatsapp-float";
import { TripPlannerProvider } from "@/components/forms/trip-planner-context";
import { RouteWipe } from "@/components/shared/motion";
import { BackToTop } from "@/components/ui/back-to-top";
import { getSiteSettings } from "@/lib/data/site";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { buildOrganizationJsonLd, JsonLd } from "@/lib/seo";

/**
 * Chrome for every public page: sticky header, footer, sticky mobile action
 * bar, the global trip planner dialog, route wipe, back-to-top and
 * organisation JSON-LD.
 */
export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, destinationRows] = await Promise.all([
    getSiteSettings(),
    getPublishedDestinations({ limit: 12 }),
  ]);

  const destinations = destinationRows.map(({ slug, name, state }) => ({
    slug,
    name,
    state,
  }));

  const jsonLd = buildOrganizationJsonLd({
    siteName: settings.siteName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    sameAs: settings.socials.map((s) => s.url),
  });

  return (
    <TripPlannerProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <RouteWipe tone="bg-tomato" />

      <SiteHeader settings={settings} destinations={destinations} />

      <main id="main-content" className="min-h-[60vh] pb-16 lg:pb-0">
        {children}
      </main>

      <SiteFooter />
      <MobileActionBar phone={settings.phone} whatsapp={settings.whatsapp} />
      <WhatsappFloat number={settings.whatsapp} />
      <BackToTop />
      <JsonLd data={jsonLd} />
    </TripPlannerProvider>
  );
}
