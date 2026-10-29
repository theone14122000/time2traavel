import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteDestinationAction } from "@/actions/admin/destinations";
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
  title: "Destinations",
  robots: { index: false, follow: false },
};

export default async function AdminDestinationsPage() {
  const destinations = await safeAdminQuery(
    "admin.destinations.list",
    () =>
      prisma.destination.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          state: true,
          published: true,
          featured: true,
          order: true,
          updatedAt: true,
          _count: { select: { packages: true } },
        },
      }),
    [],
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Destinations"
        description="Places you sell trips to. Unpublished rows stay hidden from the public site."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/destinations/new">
              <Plus aria-hidden="true" className="size-4" />
              New destination
            </Link>
          </Button>
        }
      />

      {destinations.length === 0 ? (
        <EmptyState
          eyebrow="Empty catalogue"
          title="No destinations yet"
          description="Create your first destination — it becomes selectable for packages immediately."
          icon={<MapPin aria-hidden="true" className="size-8" />}
          action={
            <Button asChild>
              <Link href="/admin/destinations/new">
                <Plus aria-hidden="true" className="size-4" />
                Create destination
              </Link>
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Packages</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-bold">{row.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    /{row.slug}
                  </span>
                </TableCell>
                <TableCell>{row.state}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={row.published ? "success" : "outline"} size="sm">
                      {row.published ? "Live" : "Draft"}
                    </Badge>
                    {row.featured ? (
                      <Badge variant="default" size="sm">
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{row._count.packages}</TableCell>
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
                      <Link href={`/admin/destinations/${row.id}`}>
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      onAction={deleteDestinationAction.bind(null, row.id)}
                      confirmTitle={`Delete ${row.name}?`}
                      confirmDescription="The destination is removed from the site. Packages keep existing but lose the link."
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
