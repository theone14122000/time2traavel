import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export type TeamMemberShape = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string | null;
  image: string | null;
  imageAlt: string | null;
  isFounder: boolean;
  socials: TeamSocial[];
  order: number;
};

export type TeamSocial = {
  kind: "linkedin" | "instagram" | "x" | "email";
  url: string;
};

function toSocials(value: unknown): TeamSocial[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const kind = record.kind;
    const url = record.url;
    if (
      (kind === "linkedin" || kind === "instagram" || kind === "x" || kind === "email") &&
      typeof url === "string" &&
      url.trim()
    ) {
      return [{ kind, url: url.trim() }];
    }
    return [];
  });
}

function toShape(row: {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string | null;
  image: string | null;
  imageAlt: string | null;
  isFounder: boolean;
  socials: unknown;
  order: number;
}): TeamMemberShape {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image: row.image,
    imageAlt: row.imageAlt,
    isFounder: row.isFounder,
    socials: toSocials(row.socials),
    order: row.order,
  };
}

const SELECT = {
  id: true,
  slug: true,
  name: true,
  role: true,
  bio: true,
  image: true,
  imageAlt: true,
  isFounder: true,
  socials: true,
  order: true,
} as const;

/** Published team members in display order (founder first when flagged). */
export async function getPublishedTeam(): Promise<TeamMemberShape[]> {
  const rows = await safeQuery(
    "team.list",
    () =>
      prisma.teamMember.findMany({
        where: { published: true },
        orderBy: [{ isFounder: "desc" }, { order: "asc" }],
        select: SELECT,
      }),
    [],
  );
  return rows.map(toShape);
}

/** The founder (isFounder = true) or null — used by footer/teaser/JSON-LD. */
export async function getFounder(): Promise<TeamMemberShape | null> {
  const row = await safeQuery(
    "team.founder",
    () =>
      prisma.teamMember.findFirst({
        where: { published: true, isFounder: true },
        orderBy: { order: "asc" },
        select: SELECT,
      }),
    null,
  );
  return row ? toShape(row) : null;
}
