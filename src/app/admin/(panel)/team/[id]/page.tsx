import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamMemberForEdit } from "@/actions/admin/team";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TeamMemberForm } from "@/components/admin/team-form";
import type { TeamMemberInput, TeamSocialInput } from "@/schemas/admin";

export const metadata: Metadata = {
  title: "Edit team member",
  robots: { index: false, follow: false },
};

function toInitialSocials(value: unknown): TeamSocialInput[] {
  if (!Array.isArray(value)) return [];
  const rows: TeamSocialInput[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const kind = record.kind;
    const url = record.url;
    if (
      (kind === "linkedin" || kind === "instagram" || kind === "x" || kind === "email") &&
      typeof url === "string" &&
      url.trim()
    ) {
      rows.push({ kind, url: url.trim() });
    }
  }
  return rows.slice(0, 4);
}

export default async function AdminTeamEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMemberForEdit(id);
  if (!member) notFound();

  const initial: TeamMemberInput = {
    name: member.name,
    slug: member.slug,
    role: member.role,
    bio: member.bio ?? "",
    image: member.image ?? "",
    imageAlt: member.imageAlt ?? "",
    isFounder: member.isFounder,
    socials: toInitialSocials(member.socials),
    order: String(member.order),
    published: member.published,
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Team"
        title={`Edit — ${member.name}`}
        description="Changes go live as soon as you save (when published)."
      />
      <TeamMemberForm memberId={member.id} initial={initial} />
    </div>
  );
}
