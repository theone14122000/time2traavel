import type { Metadata } from "next";
import Link from "next/link";
import { Package as PackageIcon, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deletePackageAction } from "@/actions/admin/packages";
import { safeAdminQuery } from "@/actions/admin/shared";
import { durationLabel, formatDate, formatPrice } from "@/lib/utils";
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
  title: "Packages",
  robots: { index: false, follow: false },
};

export default async function AdminPackagesPage() {
  const packages = await safeAdminQuery(
    "admin.packages.list",
    () =>
      prisma.package.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          durationDays: true,
          durationLabel: true,
          price: true,
          currency: true,
          published: true,
          featured: true,
          order: true,
          updatedAt: true,
          destination: { select: { name: true } },
        },
      }),
    [],
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Packages"
        description="Trips you sell. Itinerary days are edited inside each package."
        actions={
          <Button asChild size="lg">
            <Link href="/admin/packages/new">
              <Plus aria-hidden="true" className="size-4" />
              New package
            </Link>
          </Button>
        }
      />

      {packages.length === 0 ? (
        <EmptyState
          eyebrow="Empty catalogue"
          title="No packages yet"
          description="Create your first package — link it to a destination and add day-by-day itinerary."
          icon={<PackageIcon aria-hidden="true" className="size-8" />}
          action={
            <Button asChild>
              <Link href="/admin/packages/new">
                <Plus aria-hidden="true" className="size-4" />
                Create package
              </Link>
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-bold">{row.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    /{row.slug}
                  </span>
                </TableCell>
                <TableCell>{row.destination?.name ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {durationLabel(row.durationDays, row.durationLabel)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.price === null ? (
                    <span className="text-xs font-semibold uppercase text-ink-soft">
                      On request
                    </span>
                  ) : (
                    formatPrice(row.price, row.currency)
                  )}
                </TableCell>
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
                      <Link href={`/admin/packages/${row.id}`}>
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      onAction={() => deletePackageAction(row.id)}
                      confirmTitle={`Delete ${row.title}?`}
                      confirmDescription="The package and its itinerary days are removed permanently."
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
