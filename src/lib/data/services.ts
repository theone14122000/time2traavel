import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type ServiceCard = {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  color: string | null;
  shortDescription: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  order: number;
};

export type ServiceDetail = ServiceCard & {
  longDescription: string | null;
  processSteps: unknown;
  faqs: unknown;
  linkedPackageSlugs: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
};

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  icon: true,
  color: true,
  shortDescription: true,
  coverImage: true,
  coverImageAlt: true,
  order: true,
} as const;

export async function getPublishedServices(): Promise<ServiceCard[]> {
  return safeQuery(
    "services.list",
    () =>
      prisma.service.findMany({
        where: { published: true },
        select: cardSelect,
        orderBy: [{ order: "asc" }, { title: "asc" }],
      }),
    [],
  );
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  if (!slug) return null;
  return safeQuery(
    `services.slug:${slug}`,
    () =>
      prisma.service.findFirst({
        where: { slug, published: true },
        select: {
          ...cardSelect,
          longDescription: true,
          processSteps: true,
          faqs: true,
          linkedPackageSlugs: true,
          seoTitle: true,
          seoDescription: true,
          updatedAt: true,
        },
      }),
    null,
  );
}

export type ServiceProcessStep = { title: string; description: string | null };

/** `processSteps` JSON may be `[{title, description}]`, `string[]`, or junk. */
export function parseProcessSteps(value: unknown): ServiceProcessStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): ServiceProcessStep | null => {
      if (typeof entry === "string") {
        const title = entry.trim();
        return title ? { title, description: null } : null;
      }
      if (typeof entry === "object" && entry !== null) {
        const record = entry as { title?: unknown; description?: unknown };
        const title =
          typeof record.title === "string" ? record.title.trim() : "";
        if (!title) return null;
        const description =
          typeof record.description === "string" &&
          record.description.trim().length > 0
            ? record.description.trim()
            : null;
        return { title, description };
      }
      return null;
    })
    .filter((step): step is ServiceProcessStep => step !== null);
}

export type ServiceFaq = { question: string; answer: string };

/** `faqs` JSON may be `[{question, answer}]` or junk. */
export function parseServiceFaqs(value: unknown): ServiceFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): ServiceFaq | null => {
      if (typeof entry !== "object" || entry === null) return null;
      const record = entry as { question?: unknown; answer?: unknown };
      const question =
        typeof record.question === "string" ? record.question.trim() : "";
      const answer = typeof record.answer === "string" ? record.answer.trim() : "";
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((faq): faq is ServiceFaq => faq !== null);
}

/** `linkedPackageSlugs` JSON may be a string[] or a single string. */
export function parseLinkedPackageSlugs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => entry.trim())
          .filter(Boolean),
      ),
    );
  }
  if (typeof value === "string") {
    const slug = value.trim();
    return slug ? [slug] : [];
  }
  return [];
}
