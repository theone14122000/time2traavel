import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteServiceAction } from "@/actions/admin/services";
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
  title: "Services",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const services = await safeAdminQuery(
    "admin.services.list",
    () =>
      prisma.service.findMany({
        orderBy: [{ order: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
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
        title="Services"
        description="Services you offer. Unpublished rows stay hidden from the public site."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/services/new">
              <Plus aria-hidden="true" className="size-4" />
              New service
            </Link>
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          eyebrow="Empty catalogue"
          title="No services yet"
          description="Create your first service — it appears on the public site once published."
          icon={<Briefcase aria-hidden="true" className="size-8" />}
          action={
            <Button asChild>
              <Link href="/admin/services/new">
                <Plus aria-hidden="true" className="size-4" />
                Create service
              </Link>
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-bold">{row.title}</span>
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
                      <Link href={`/admin/services/${row.id}`}>
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      onAction={deleteServiceAction.bind(null, row.id)}
                      confirmTitle={`Delete ${row.title}?`}
                      confirmDescription="The service is removed from the site permanently."
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
