import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteGuidePostAction } from "@/actions/admin/guides";
import { safeAdminQuery } from "@/actions/admin/shared";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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

export const metadata: Metadata = {
  title: "Guides",
  robots: { index: false, follow: false },
};

export default async function AdminGuidesPage() {
  const guides = await safeAdminQuery(
    "admin.guides.list",
    () =>
      prisma.guidePost.findMany({
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          readingMinutes: true,
          published: true,
          createdAt: true,
        },
      }),
    [],
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Guides"
        description="Travel guides and articles. Unpublished posts stay hidden from the public site."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/guides/new">
              <Plus aria-hidden="true" className="size-4" />
              New guide
            </Link>
          </Button>
        }
      />

      {guides.length === 0 ? (
        <EmptyState
          eyebrow="Empty catalogue"
          title="No guides yet"
          description="Create your first guide — it appears on the public site once published."
          icon={<BookOpen aria-hidden="true" className="size-8" />}
          action={
            <Button asChild>
              <Link href="/admin/guides/new">
                <Plus aria-hidden="true" className="size-4" />
                Create guide
              </Link>
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[48rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Read time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guides.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-bold">{row.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    /{row.slug}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="soft" size="sm">
                    {row.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.readingMinutes ? `${row.readingMinutes} min` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={row.published ? "success" : "outline"} size="sm">
                    {row.published ? "Live" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-ink-soft">
                  {formatDate(row.createdAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild variant="soft" size="sm">
                      <Link href={`/admin/guides/${row.id}`}>
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      onAction={() => deleteGuidePostAction(row.id)}
                      confirmTitle={`Delete ${row.title}?`}
                      confirmDescription="The guide is removed from the site permanently."
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
