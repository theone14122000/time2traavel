import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  User,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  deleteTeamMemberAction,
  reorderTeamMemberAction,
  toggleTeamMemberAction,
} from "@/actions/admin/team";
import { safeAdminQuery } from "@/actions/admin/shared";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AsyncButton } from "@/components/admin/async-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

export default async function AdminTeamPage() {
  const members = await safeAdminQuery(
    "admin.team.list",
    () =>
      prisma.teamMember.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          role: true,
          image: true,
          imageAlt: true,
          isFounder: true,
          published: true,
          order: true,
        },
      }),
    [],
  );

  const ids = members.map((member) => member.id);

  function swapped(index: number, direction: "up" | "down"): string[] {
    const next = [...ids];
    const other = direction === "up" ? index - 1 : index + 1;
    if (other < 0 || other >= next.length) return next;
    const current = next[index];
    next[index] = next[other];
    next[other] = current;
    return next;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Team"
        description="The people behind the agency. Unpublished rows stay hidden from the public site."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/team/new">
              <Plus aria-hidden="true" className="size-4" />
              Add member
            </Link>
          </Button>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          eyebrow="Empty roster"
          title="No team members yet"
          description="Add the people behind the agency — published rows show on the About page."
          icon={<Users aria-hidden="true" className="size-8" />}
          action={
            <Button asChild>
              <Link href="/admin/team/new">
                <Plus aria-hidden="true" className="size-4" />
                Add member
              </Link>
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="relative block size-12 shrink-0 overflow-hidden rounded-full border border-line bg-sand">
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.image}
                          alt={row.imageAlt ?? ""}
                          className="size-full object-cover"
                        />
                      ) : (
                        <User
                          aria-hidden="true"
                          className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-ink-soft"
                        />
                      )}
                    </span>
                    <span>
                      <span className="block font-bold">{row.name}</span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{row.role}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={row.published ? "success" : "outline"} size="sm">
                      {row.published ? "Live" : "Draft"}
                    </Badge>
                    {row.isFounder ? (
                      <Badge variant="default" size="sm">
                        Founder
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{row.order}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <AsyncButton
                      variant="outline"
                      size="icon-sm"
                      aria-label={row.published ? `Unpublish ${row.name}` : `Publish ${row.name}`}
                      title={row.published ? "Unpublish" : "Publish"}
                      onAction={() => toggleTeamMemberAction(row.id, "published")}
                    >
                      {row.published ? (
                        <Eye aria-hidden="true" className="size-4" />
                      ) : (
                        <EyeOff aria-hidden="true" className="size-4" />
                      )}
                    </AsyncButton>
                    <AsyncButton
                      variant="outline"
                      size="icon-sm"
                      aria-label={
                        row.isFounder
                          ? `Remove founder flag from ${row.name}`
                          : `Make ${row.name} the founder`
                      }
                      title={row.isFounder ? "Unset founder" : "Make founder"}
                      onAction={() => toggleTeamMemberAction(row.id, "isFounder")}
                    >
                      <Crown aria-hidden="true" className="size-4" />
                    </AsyncButton>
                    <AsyncButton
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Move ${row.name} up`}
                      title="Move up"
                      disabled={index === 0}
                      onAction={() => reorderTeamMemberAction(swapped(index, "up"))}
                    >
                      <ArrowUp aria-hidden="true" className="size-4" />
                    </AsyncButton>
                    <AsyncButton
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Move ${row.name} down`}
                      title="Move down"
                      disabled={index === members.length - 1}
                      onAction={() => reorderTeamMemberAction(swapped(index, "down"))}
                    >
                      <ArrowDown aria-hidden="true" className="size-4" />
                    </AsyncButton>
                    <Button asChild variant="soft" size="sm">
                      <Link href={`/admin/team/${row.id}`}>
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      onAction={() => deleteTeamMemberAction(row.id)}
                      confirmTitle={`Delete ${row.name}?`}
                      confirmDescription="The member is removed from the team list on the site."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
