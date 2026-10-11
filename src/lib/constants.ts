/**
 * Known, verified business details for Time to Travel.
 * These are factual constants (not marketing content) and act as fallbacks
 * until the admin fills in Site Settings / Page Content.
 */
export const SITE_IDENTITY = {
  name: "Time to Travel",
  address: "Kasumpti, Shimla, Himachal Pradesh, India",
  founder: "Gaurav Bhardwaj",
} as const;

/** Nav used by header + footer + mobile drawer. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
  "GENERAL" | "TRIP_PLAN" | "PACKAGE" | "DESTINATION",
  string
> = {
  GENERAL: "General enquiry",
  TRIP_PLAN: "Trip planning",
  PACKAGE: "Package enquiry",
  DESTINATION: "Destination enquiry",
};

export const INQUIRY_STATUSES: Record<"NEW" | "CONTACTED" | "CLOSED", string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export const PAGE_SIZE = 9;
