import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TeamMemberForm } from "@/components/admin/team-form";

export const metadata: Metadata = {
  title: "New team member",
  robots: { index: false, follow: false },
};

export default function AdminTeamNewPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Team"
        title="New team member"
        description="Name, slug and role are required — everything else can be filled later."
      />
      <TeamMemberForm />
    </div>
  );
}
