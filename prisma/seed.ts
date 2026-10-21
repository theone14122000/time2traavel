import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SITE_IDENTITY } from "../src/lib/constants";
import { IMAGE_MANIFEST } from "../src/lib/image-manifest";

const prisma = new PrismaClient();

async function seedSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { id: true },
  });
  if (existing) {
    console.log("[seed] SiteSettings singleton already exists — leaving untouched.");
    return;
  }
  await prisma.siteSettings.create({
    data: {
      id: "singleton",
      siteName: SITE_IDENTITY.name,
      address: SITE_IDENTITY.address,
    },
  });
  console.log("[seed] Created SiteSettings singleton with factual defaults.");
}

async function seedMediaAssets() {
  let created = 0;
  let updated = 0;
  for (const entry of IMAGE_MANIFEST) {
    const existing = await prisma.mediaAsset.findFirst({
      where: { url: entry.url },
      select: { id: true },
    });
    if (existing) {
      await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          alt: entry.suggestedAlt,
          region: entry.region,
          tags: JSON.stringify(entry.tags),
          provider: "LOCAL",
        },
      });
      updated += 1;
    } else {
      await prisma.mediaAsset.create({
        data: {
          url: entry.url,
          alt: entry.suggestedAlt,
          region: entry.region,
          tags: JSON.stringify(entry.tags),
          publicId: entry.filename,
          provider: "LOCAL",
        },
      });
      created += 1;
    }
  }
  console.log(`[seed] MediaAsset: ${created} created, ${updated} updated.`);
}

async function seedAdminUser() {
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Administrator";
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    console.warn(
      "[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user.",
    );
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (existing) {
    console.log(`[seed] Admin user ${email} already exists — leaving untouched.`);
    return;
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });
  console.log(`[seed] Created admin user ${email}.`);
}

async function main() {
  console.log("[seed] Running seed (no demo content — factual data only)...");
  await seedSiteSettings();
  await seedContactValues();
  await seedAdminUser();
  await seedTeamMembers();
  await seedDestinationTaxonomy();
  await seedDraftServices();
  await seedTripTypes();
  await seedHomeSections();
  await seedMediaAssets();
  console.log("[seed] Done.");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Fills missing contact values only — never overwrites admin edits. */
async function seedContactValues() {
  const current = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { phone: true, whatsapp: true, supportPhone: true, email: true },
  });
  if (!current) return;
  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      phone: current.phone ?? "+919882726990",
      whatsapp: current.whatsapp ?? "+918351823736",
      supportPhone: current.supportPhone ?? "+919805029089",
      email: current.email ?? "info@time2travel.com",
    },
  });
  console.log("[seed] Contact values ensured in SiteSettings.");
}

/** The three real team members (founder bio provided by the business). */
async function seedTeamMembers() {
  const members = [
    {
      slug: "prachi-bhardwaj",
      name: "Prachi Bhardwaj",
      role: "Founder",
      isFounder: true,
      image: "/team/prachi-bhardwaj.jpg",
      imageAlt: "Portrait of Prachi Bhardwaj, Founder",
      bio: "Prachi Bhardwaj founded Time to Travel with more than 4 years of experience in the travel industry. She leads the company's vision and oversees how every trip is planned, so each itinerary is built around the traveller, not a template.",
      order: 0,
    },
    {
      slug: "gaurav-sharma",
      name: "Gaurav Sharma",
      role: "Head of Operations",
      isFounder: false,
      image: "/team/gaurav-sharma.jpg",
      imageAlt: "Portrait of Gaurav Sharma, Head of Operations",
      order: 1,
    },
    {
      slug: "shubham-sharma",
      name: "Shubham Sharma",
      role: "I.T Head",
      isFounder: false,
      image: "/team/shubham-sharma.jpg",
      imageAlt: "Portrait of Shubham Sharma, I.T Head",
      order: 2,
    },
  ];
  let created = 0;
  for (const member of members) {
    const existing = await prisma.teamMember.findUnique({
      where: { slug: member.slug },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.teamMember.create({ data: member });
    created++;
  }
  console.log(`[seed] Team members: ${created} created (${members.length - created} existing).`);
}

/** Taxonomy-only destination names (unpublished; no descriptions/prices/claims). */
async function seedDestinationTaxonomy() {
  const taxonomy: Array<{
    name: string;
    state: string;
    country?: string;
    isInternational: boolean;
  }> = [
    // International (per brief; Andaman & Nicobar is an Indian UT flagged international per brief — admin can flip one click)
    { name: "Dubai", state: "Dubai", country: "United Arab Emirates", isInternational: true },
    { name: "Nepal", state: "Nepal", country: "Nepal", isInternational: true },
    { name: "Bhutan", state: "Bhutan", country: "Bhutan", isInternational: true },
    { name: "Myanmar", state: "Myanmar", country: "Myanmar", isInternational: true },
    { name: "Andaman & Nicobar Islands", state: "Andaman & Nicobar Islands", country: "India", isInternational: true },
    // Domestic regions
    { name: "Himachal Pradesh", state: "Himachal Pradesh", isInternational: false },
    { name: "Uttarakhand", state: "Uttarakhand", isInternational: false },
    { name: "Jammu & Kashmir", state: "Jammu & Kashmir", isInternational: false },
    { name: "Ladakh", state: "Ladakh", isInternational: false },
    { name: "Rajasthan", state: "Rajasthan", isInternational: false },
    { name: "Goa", state: "Goa", isInternational: false },
    { name: "Kerala", state: "Kerala", isInternational: false },
    { name: "North East India", state: "North East", isInternational: false },
  ];
  let created = 0;
  for (const [index, item] of taxonomy.entries()) {
    const slug = slugify(item.name);
    const existing = await prisma.destination.findUnique({ where: { slug }, select: { id: true } });
    if (existing) continue;
    await prisma.destination.create({
      data: {
        slug,
        name: item.name,
        state: item.state,
        country: item.country ?? "India",
        isInternational: item.isInternational,
        published: false,
        order: index,
      },
    });
    created++;
  }
  console.log(`[seed] Destination taxonomy: ${created} created (${taxonomy.length - created} existing).`);
}

/** Stock service NAMES only, unpublished drafts — client enables what they truly offer. */
async function seedDraftServices() {
  const names = [
    "Holiday Packages",
    "Customized Tours",
    "Flight Tickets",
    "Hotel Bookings",
    "Visa Assistance",
    "Passport Assistance",
    "Cab and Car Rental",
    "Tour Guides",
    "Honeymoon Trips",
    "Group Tours",
    "Corporate Travel",
    "Pilgrimage Tours",
    "Adventure Trips",
    "Travel Insurance",
    "Forex Assistance",
  ];
  let created = 0;
  for (const [index, title] of names.entries()) {
    const slug = slugify(title);
    const existing = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
    if (existing) continue;
    await prisma.service.create({
      data: { slug, title, published: false, order: index },
    });
    created++;
  }
  console.log(`[seed] Draft services: ${created} created (${names.length - created} existing).`);
}

async function seedTripTypes() {
  const names = [
    "Family",
    "Honeymoon",
    "Adventure",
    "Group",
    "Weekend Getaway",
    "Pilgrimage",
    "Corporate",
  ];
  let created = 0;
  for (const [index, name] of names.entries()) {
    const slug = slugify(name);
    const existing = await prisma.tripType.findUnique({ where: { slug }, select: { id: true } });
    if (existing) continue;
    await prisma.tripType.create({
      data: { slug, name, published: true, order: index },
    });
    created++;
  }
  console.log(`[seed] Trip types: ${created} created (${names.length - created} existing).`);
}

/** Default home section order/enabled flags (admin can toggle + drag-reorder). */
async function seedHomeSections() {
  const defaults: Array<{ key: string; enabled: boolean; order: number }> = [
    { key: "announcement", enabled: true, order: 0 },
    { key: "hero", enabled: true, order: 1 },
    { key: "marquee", enabled: true, order: 2 },
    { key: "domestic", enabled: true, order: 3 },
    { key: "international", enabled: true, order: 4 },
    { key: "featured_packages", enabled: true, order: 5 },
    { key: "services", enabled: true, order: 6 },
    { key: "how_it_works", enabled: true, order: 7 },
    { key: "trip_types", enabled: true, order: 8 },
    { key: "destination_finder", enabled: true, order: 9 },
    { key: "gallery", enabled: true, order: 10 },
    { key: "reviews", enabled: true, order: 11 },
    { key: "guides", enabled: true, order: 12 },
    { key: "founder", enabled: true, order: 13 },
    { key: "faq", enabled: true, order: 14 },
    { key: "final_cta", enabled: true, order: 15 },
  ];
  let created = 0;
  for (const item of defaults) {
    const existing = await prisma.homeSection.findUnique({ where: { key: item.key }, select: { id: true } });
    if (existing) continue;
    await prisma.homeSection.create({ data: item });
    created++;
  }
  console.log(`[seed] Home sections: ${created} created (${defaults.length - created} existing).`);
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
