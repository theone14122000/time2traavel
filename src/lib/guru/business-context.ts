import "server-only";
import { getSiteSettings } from "@/lib/data/site";
import { getDomesticDestinations } from "@/lib/data/domestic-destinations";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { getPackages, type PackageCard } from "@/lib/data/packages";
import { getPublishedTripTypes } from "@/lib/data/trip-types";
import { getPublishedServices } from "@/lib/data/services";
import { getPublishedGuides } from "@/lib/data/guides";
import { getPublishedFaqs } from "@/lib/data/reviews";
import { getPageContent } from "@/lib/data/site";
import { SITE_IDENTITY } from "@/lib/constants";
import { formatPhoneDisplay } from "@/lib/contact";

/** Fixed site pages GURU may link to. Detail pages are added from live data. */
const STATIC_PATHS = [
  "/destinations",
  "/destinations/domestic",
  "/destinations/international",
  "/packages",
  "/gallery",
  "/travel-guides",
  "/travel-essentials",
  "/trip-types",
  "/services",
  "/about-us",
  "/faqs",
  "/reviews",
  "/plan-my-trip",
];

export type BusinessContext = {
  /** Plain-text block injected into the system prompt (verified data only). */
  text: string;
  /** Every path GURU is allowed to link to. */
  allowedPaths: Set<string>;
  whatsapp: string | null;
};

const CACHE_MS = 5 * 60 * 1000;
let cache: { at: number; value: Omit<BusinessContext, "text"> & { base: string; packages: PackageCard[] } } | null = null;

function clip(text: string | null | undefined, max: number): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

async function load() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  const [settings, domestic, dbDestinations, pkgs, tripTypes, services, guides, faqs, refund, story] =
    await Promise.all([
      getSiteSettings(),
      getDomesticDestinations(),
      getPublishedDestinations({ limit: 60 }),
      getPackages({ sort: "popular", page: 1, pageSize: 60 }),
      getPublishedTripTypes(),
      getPublishedServices(),
      getPublishedGuides({ limit: 30 }),
      getPublishedFaqs(),
      getPageContent("legal.cancellationRefund" as never),
      getPageContent("about.story" as never),
    ]);

  const allowedPaths = new Set<string>(STATIC_PATHS);
  for (const d of domestic) allowedPaths.add(`/destinations/${d.slug}`);
  for (const d of dbDestinations) allowedPaths.add(`/destinations/${d.slug}`);
  for (const p of pkgs.items) allowedPaths.add(`/packages/${p.slug}`);
  for (const t of tripTypes) allowedPaths.add(`/trip-types/${t.slug}`);
  for (const sv of services) allowedPaths.add(`/services/${sv.slug}`);
  for (const g of guides) allowedPaths.add(`/travel-guides/${g.slug}`);

  const lines: string[] = [];
  lines.push(`Business: ${settings.siteName}${settings.tagline ? ` — ${settings.tagline}` : ""}`);
  lines.push(`Base: ${settings.address}`);
  if (settings.workingHours) lines.push(`Working hours: ${settings.workingHours}`);
  const phone = formatPhoneDisplay(settings.phone);
  if (phone) lines.push(`Phone: ${phone}`);
  if (settings.email) lines.push(`Email: ${settings.email}`);
  lines.push(
    settings.whatsapp
      ? "WhatsApp: available (use the offer_whatsapp tool; never print the number yourself)"
      : "WhatsApp: not configured",
  );

  lines.push("");
  lines.push("DESTINATIONS FEATURED ON THE TIME2TRAVEL WEBSITE (verified):");
  for (const d of domestic) {
    lines.push(
      `- ${d.name} [/destinations/${d.slug}] — ${clip(d.tagline, 120)}. Overview: ${clip(d.overview, 260)} Known for: ${d.knownFor.join(", ")}. Best time (site guidance): ${clip(d.bestTime, 110)}`,
    );
  }
  const domesticSlugs = new Set(domestic.map((d) => d.slug));
  for (const d of dbDestinations) {
    if (domesticSlugs.has(d.slug)) continue;
    lines.push(`- ${d.name}, ${d.state} [/destinations/${d.slug}]${d.summary ? ` — ${clip(d.summary, 110)}` : ""}`);
  }

  lines.push("");
  lines.push(
    pkgs.items.length > 0
      ? `PUBLISHED PACKAGES (verified, ${pkgs.total} total):`
      : "PUBLISHED PACKAGES: none are currently published on the website. Do not claim any package exists; offer a custom plan instead.",
  );

  if (services.length > 0) {
    lines.push("");
    lines.push("SERVICES TIME2TRAVEL OFFERS (verified):");
    for (const sv of services) {
      lines.push(`- ${sv.title} [/services/${sv.slug}]${sv.shortDescription ? ` — ${clip(sv.shortDescription, 160)}` : ""}`);
    }
  }

  if (faqs.length > 0) {
    lines.push("");
    lines.push("FREQUENTLY ASKED QUESTIONS ON THE WEBSITE (verified answers):");
    for (const f of faqs.slice(0, 20)) lines.push(`- Q: ${clip(f.question, 120)} A: ${clip(f.answer, 240)}`);
  }

  if (refund?.body?.trim()) {
    lines.push("");
    lines.push(`CANCELLATION & REFUND POLICY (as published, summarised): ${clip(refund.body, 700)} [/cancellation-refund]`);
  } else {
    lines.push("");
    lines.push("CANCELLATION & REFUND POLICY: not published online. Do not state terms; direct the visitor to the team.");
  }

  if (story?.body?.trim()) {
    lines.push("");
    lines.push(`ABOUT ${SITE_IDENTITY.name.toUpperCase()}: ${clip(story.body, 500)} [/about-us]`);
  }

  if (guides.length > 0) {
    lines.push("");
    lines.push("TRAVEL GUIDES ON THE WEBSITE:");
    for (const g of guides.slice(0, 15)) {
      lines.push(`- ${g.title} (${g.category}) [/travel-guides/${g.slug}]${g.excerpt ? ` — ${clip(g.excerpt, 120)}` : ""}`);
    }
  }

  if (tripTypes.length > 0) {
    lines.push("");
    lines.push(`TRIP TYPES ON THE WEBSITE: ${tripTypes.map((t) => `${t.name}${t.description ? ` (${clip(t.description, 90)})` : ""} [/trip-types/${t.slug}]`).join("; ")}`);
  }

  const value = {
    base: lines.join("\n"),
    allowedPaths,
    whatsapp: settings.whatsapp,
    packages: pkgs.items,
  };
  cache = { at: Date.now(), value };
  return value;
}

function packageLine(p: PackageCard): string {
  const price =
    p.price != null
      ? `listed price ${p.currency} ${p.price}${p.priceNote ? ` (${clip(p.priceNote, 60)})` : ""} — a website listing, not a quote`
      : "price on request";
  return `- ${p.title} [/packages/${p.slug}] — ${p.durationLabel ?? `${p.durationDays} days`}${p.destination ? `, ${p.destination.name}` : ""}; ${price}${p.summary ? `; ${clip(p.summary, 120)}` : ""}`;
}

/**
 * Verified business context for one request. Packages are shortlisted by
 * simple keyword overlap with the visitor's recent messages (the catalogue is
 * small; a vector index would add cost without improving recall).
 */
export async function getBusinessContext(recentUserText: string): Promise<BusinessContext> {
  const data = await load();
  const words = new Set(
    recentUserText
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3),
  );
  const scored = data.packages
    .map((p) => {
      const hay = `${p.title} ${p.destination?.name ?? ""} ${p.destination?.state ?? ""} ${p.summary ?? ""}`.toLowerCase();
      let score = p.featured ? 0.5 : 0;
      for (const w of words) if (hay.includes(w)) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.p);

  const text = scored.length > 0 ? `${data.base}\n${scored.map(packageLine).join("\n")}` : data.base;
  return { text, allowedPaths: data.allowedPaths, whatsapp: data.whatsapp };
}
