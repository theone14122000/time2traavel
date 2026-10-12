import type { Metadata } from "next";
import Link from "next/link";
import { Download, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/actions/admin/shared";
import { formatDate } from "@/lib/utils";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "@/lib/constants";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { InquiryStatus, InquiryType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

const statusVariant = {
  NEW: "default",
  IN_PROGRESS: "lavender",
  QUOTED: "peach",
  CONTACTED: "sky",
  CLOSED: "outline",
} as const;

function buildHref(params: { status?: string; type?: string }) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  const qs = query.toString();
  return qs ? `/admin/inquiries?${qs}` : "/admin/inquiries";
}

/**
 * The Inquiry model stores `packageId` / `destinationId` as plain columns
 * (no Prisma relation), so linked titles are resolved with two extra lookups.
 */
async function attachLinkedNames<
  T extends { packageId: string | null; destinationId: string | null },
>(rows: T[]) {
  const packageIds = Array.from(
    new Set(rows.map((row) => row.packageId).filter((v): v is string => Boolean(v))),
  );
  const destinationIds = Array.from(
    new Set(
      rows.map((row) => row.destinationId).filter((v): v is string => Boolean(v)),
    ),
  );

  const [packages, destinations] = await Promise.all([
    packageIds.length
      ? prisma.package.findMany({
          where: { id: { in: packageIds } },
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
    destinationIds.length
      ? prisma.destination.findMany({
          where: { id: { in: destinationIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const packageTitles = new Map(packages.map((row) => [row.id, row.title]));
  const destinationNames = new Map(destinations.map((row) => [row.id, row.name]));

  return rows.map((row) => ({
    ...row,
    packageTitle: row.packageId ? packageTitles.get(row.packageId) ?? null : null,
    destinationName: row.destinationId
      ? destinationNames.get(row.destinationId) ?? null
      : null,
  }));
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status && sp.status in INQUIRY_STATUSES
      ? (sp.status as InquiryStatus)
      : undefined;
  const type =
    sp.type && sp.type in INQUIRY_TYPES ? (sp.type as InquiryType) : undefined;

  const [inquiries, counts] = await Promise.all([
    safeAdminQuery(
      "admin.inquiries.list",
      async () => {
        const rows = await prisma.inquiry.findMany({
          where: {
            ...(status ? { status } : {}),
            ...(type ? { type } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
        return attachLinkedNames(rows);
      },
      [],
    ),
    safeAdminQuery(
      "admin.inquiries.counts",
      () => prisma.inquiry.groupBy({ by: ["status"], _count: true }),
      [],
    ),
  ]);

  const countFor = (value: InquiryStatus) =>
    counts.find((row) => row.status === value)?._count ?? 0;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Enquiries"
        description="Every public form submission, newest first. Open a row for full details."
        actions={
          <Button asChild variant="dark" size="lg">
            <a href="/api/admin/inquiries/export" download>
              <Download aria-hidden="true" className="size-4" />
              Export CSV
            </a>
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="no-scrollbar flex flex-wrap gap-2">
          <Link
            href={buildHref({ type: sp.type })}
            className={cn(
              "border-[3px] border-ink px-3 py-2 text-xs font-bold uppercase shadow-hard-xs",
              !status ? "bg-lemon" : "bg-paper hover:bg-butter",
            )}
          >
            All (
            {Object.keys(INQUIRY_STATUSES).reduce(
              (sum, key) => sum + countFor(key as InquiryStatus),
              0,
            )}
            )
          </Link>
          {(
            Object.entries(INQUIRY_STATUSES) as [
              InquiryStatus,
              string,
            ][]
          ).map(([value, label]) => (
            <Link
              key={value}
              href={buildHref({ status: value, type: sp.type })}
              className={cn(
                "border-[3px] border-ink px-3 py-2 text-xs font-bold uppercase shadow-hard-xs",
                status === value ? "bg-lemon" : "bg-paper hover:bg-butter",
              )}
            >
              {label} ({countFor(value)})
            </Link>
          ))}
        </div>

        <div className="no-scrollbar flex flex-wrap gap-2">
          <Link
            href={buildHref({ status: sp.status })}
            className={cn(
              "border-[2px] border-ink px-2.5 py-1.5 text-[0.7rem] font-bold uppercase",
              !type ? "bg-ink text-cream" : "bg-paper hover:bg-butter",
            )}
          >
            All types
          </Link>
          {(
            Object.entries(INQUIRY_TYPES) as [InquiryType, string][]
          ).map(([value, label]) => (
            <Link
              key={value}
              href={buildHref({ status: sp.status, type: value })}
              className={cn(
                "border-[2px] border-ink px-2.5 py-1.5 text-[0.7rem] font-bold uppercase",
                type === value ? "bg-ink text-cream" : "bg-paper hover:bg-butter",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          eyebrow="Inbox"
          title="No enquiries match"
          description="Adjust the filters — or wait for the first submission from the site."
          icon={<Inbox aria-hidden="true" className="size-8" />}
        />
      ) : (
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link
                    href={`/admin/inquiries/${row.id}`}
                    className="font-bold underline underline-offset-4 hover:bg-lemon"
                  >
                    {row.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-ink-soft">
                    {row.email}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs font-bold uppercase">
                  {INQUIRY_TYPES[row.type] ?? row.type}
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate">
                    {row.subject ||
                      row.message?.slice(0, 80) ||
                      (row.packageTitle ? `Package: ${row.packageTitle}` : "—")}
                  </p>
                  {row.destinationName ? (
                    <span className="mt-0.5 block text-xs text-ink-soft">
                      Destination: {row.destinationName}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status]} size="sm">
                    {INQUIRY_STATUSES[row.status] ?? row.status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-ink-soft">
                  {formatDate(row.createdAt, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
