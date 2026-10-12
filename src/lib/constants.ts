/**
 * Known, verified business details for Time to Travel.
 * These are factual constants (not marketing content) and act as fallbacks
 * until the admin fills in Site Settings / Page Content.
 */
export const SITE_IDENTITY = {
  name: "Time2Travel",
  address: "Kasumpti, Shimla, Himachal Pradesh, India",
} as const;

/** Nav used by header + footer + mobile drawer. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/about-us", label: "About Us" },
] as const;

/**
 * Filter taxonomy only — no listings or claims are implied by these labels.
 * Destinations themselves live in the database and are managed via admin.
 */
export const REGION_FILTERS = [
  "All",
  "Himachal Pradesh",
  "Uttarakhand",
  "Kashmir",
  "Rajasthan",
  "Goa",
  "Kerala",
  "Northeast",
  "Ladakh",
  "East India",
  "West India",
  "Central India",
  "South India",
  "North India",
] as const;

export const TRIP_TYPES = [
  "Leisure",
  "Family",
  "Honeymoon",
  "Adventure",
  "Pilgrimage",
  "Corporate",
  "Custom",
] as const;

export const BUDGET_RANGES = [
  "Budget",
  "Standard",
  "Premium",
  "Luxury",
  "To be discussed",
] as const;

export const TRAVELLER_COUNTS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8+",
] as const;

export const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "YouTube",
  "X",
  "LinkedIn",
] as const;

export const CONTENT_KEYS = {
  homeHero: "home.hero",
  homeWhyChooseUs: "home.whyChooseUs",
  homeFinalCta: "home.finalCta",
  aboutStory: "about.story",
  aboutFounder: "about.founder",
  aboutMission: "about.mission",
  privacy: "legal.privacy",
  terms: "legal.terms",
} as const;

export const INQUIRY_TYPES: Record<
  "GENERAL" | "TRIP_PLAN" | "PACKAGE" | "DESTINATION" | "SERVICE",
  string
> = {
  GENERAL: "General enquiry",
  TRIP_PLAN: "Trip planning",
  PACKAGE: "Package enquiry",
  DESTINATION: "Destination enquiry",
  SERVICE: "Service enquiry",
};

export const INQUIRY_STATUSES: Record<
  "NEW" | "IN_PROGRESS" | "QUOTED" | "CONTACTED" | "CLOSED",
  string
> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  QUOTED: "Quoted",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export const PAGE_SIZE = 9;

/** Fixed home-section keys (created by the seed — the manager only edits them). */
export const HOME_SECTION_KEYS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "announcement", label: "Announcement" },
  { key: "hero", label: "Hero" },
  { key: "marquee", label: "Marquee" },
  { key: "domestic", label: "Domestic" },
  { key: "international", label: "International" },
  { key: "featured_packages", label: "Featured packages" },
  { key: "services", label: "Services" },
  { key: "how_it_works", label: "How it works" },
  { key: "trip_types", label: "Trip types" },
  { key: "destination_finder", label: "Destination finder" },
  { key: "gallery", label: "Gallery" },
  { key: "reviews", label: "Reviews" },
  { key: "guides", label: "Guides" },
  { key: "founder", label: "Founder" },
  { key: "faq", label: "FAQ" },
  { key: "final_cta", label: "Final CTA" },
] as const;

/** Datalist suggestions for gallery categories — free text, never enforced. */
export const GALLERY_CATEGORIES = [
  "General",
  "Destinations",
  "Packages",
  "Team",
  "Office",
] as const;
