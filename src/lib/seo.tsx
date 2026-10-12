import type { Metadata } from "next";
import { SITE_IDENTITY } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

type BuildMetadataInput = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
};

/**
 * Consistent per-page metadata with Open Graph + Twitter tags.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const siteName = SITE_IDENTITY.name;
  const fullTitle = title.includes(siteName) ? title : `${title} · ${siteName}`;
  const desc =
    description?.trim() ||
    `${siteName} — travel planning from Kasumpti, Shimla, Himachal Pradesh.`;
  const ogImage = image || absoluteUrl("/og-image.svg");

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName,
      type,
      images: [{ url: ogImage, alt: fullTitle }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

/** TravelAgency + LocalBusiness JSON-LD with the Shimla office address. */
export function buildOrganizationJsonLd(settings?: {
  siteName?: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  url?: string;
  sameAs?: string[];
}) {
  const name = settings?.siteName?.trim() || SITE_IDENTITY.name;
  const address = settings?.address?.trim() || SITE_IDENTITY.address;
  const url = settings?.url || absoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${url}#organization`,
        name,
        url,
        logo: absoluteUrl("/logo.svg"),
        address: {
          "@type": "PostalAddress",
          streetAddress: "Kasumpti",
          addressLocality: "Shimla",
          addressRegion: "Himachal Pradesh",
          addressCountry: "IN",
          ...(address ? { description: address } : {}),
        },
        ...(settings?.phone ? { telephone: settings.phone } : {}),
        ...(settings?.email ? { email: settings.email } : {}),
      },
      {
        "@type": ["LocalBusiness", "TravelAgency"],
        "@id": `${url}#localbusiness`,
        name,
        url,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Kasumpti",
          addressLocality: "Shimla",
          addressRegion: "Himachal Pradesh",
          postalCode: "171009",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 31.1048,
          longitude: 77.1734,
        },
        ...(settings?.sameAs?.length ? { sameAs: settings.sameAs } : {}),
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildProductJsonLd(input: {
  name: string;
  description?: string | null;
  path: string;
  image?: string | null;
  price?: number | null;
  currency?: string;
  durationDays?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.name,
    description: input.description ?? undefined,
    url: absoluteUrl(input.path),
    ...(input.image ? { image: input.image } : {}),
    ...(input.durationDays
      ? { itinerary: { "@type": "ItemList", numberOfItems: input.durationDays } }
      : {}),
    ...(input.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: input.price,
            priceCurrency: input.currency ?? "INR",
            availability: "https://schema.org/OnlineOnly",
            url: absoluteUrl(input.path),
          },
        }
      : {}),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
