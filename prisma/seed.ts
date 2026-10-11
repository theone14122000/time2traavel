import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { SITE_IDENTITY } from "../src/lib/constants";

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
  await seedAdminUser();
  console.log("[seed] Done.");
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
