import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Route } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteTripTypeAction } from "@/actions/admin/trip-types";
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trip types",
  robots: { index: false, follow: false },
};

export default async function AdminTripTypesPage() {
  const tripTypes = await safeAdminQuery(
    "admin.tripTypes.list",
    () =>
      prisma.tripType.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          published: true,
          order: true,
          updatedAt: true,
        },
      }),
    [],
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Trip types"
        description="Trip categories shown as filters and cards. Unpublished rows stay hidden."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/trip-types/new">
              <Plus aria-hidden="true" className="size-4" />
              New trip type
            </Link>
          </Button>
        }
      />

      {tripTypes.length === 0 ? (
        <EmptyState
          eyebrow="Empty catalogue"
          title="No trip types yet"
          description="Create your first trip type — it becomes selectable across the site once published."
          icon={<Route aria-hidden="true" className="size-8" />}
          action={
            <Button asChild>
              <Link href="/admin/trip-types/new">
                <Plus aria-hidden="true" className="size-4" />
                Create trip type
              </Link>
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tripTypes.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-bold">{row.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    /{row.slug}
                  </span>
                </TableCell>
                <TableCell>{row.icon ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={row.published ? "success" : "outline"} size="sm">
                    {row.published ? "Live" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>{row.order}</TableCell>
                <TableCell className="text-xs text-ink-soft">
                  {formatDate(row.updatedAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild variant="soft" size="sm">
                      <Link href={`/admin/trip-types/${row.id}`}>
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      onAction={deleteTripTypeAction.bind(null, row.id)}
                      confirmTitle={`Delete ${row.name}?`}
                      confirmDescription="The trip type is removed from the site permanently."
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
