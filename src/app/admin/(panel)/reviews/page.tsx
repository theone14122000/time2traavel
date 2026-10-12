import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/actions/admin/shared";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import { Badge } from "@/components/ui/badge";
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
import type { ReviewStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

const statusVariant = {
  PENDING: "default",
  APPROVED: "success",
  REJECTED: "danger",
} as const;

function normaliseStatus(value: string | undefined): ReviewStatus {
  return STATUSES.includes(value as (typeof STATUSES)[number])
    ? (value as ReviewStatus)
    : "PENDING";
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = normaliseStatus(statusParam);

  const [reviews, counts] = await Promise.all([
    safeAdminQuery(
      "admin.reviews.list",
      () =>
        prisma.review.findMany({
          where: { status },
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
      [],
    ),
    safeAdminQuery(
      "admin.reviews.counts",
      () => prisma.review.groupBy({ by: ["status"], _count: true }),
      [],
    ),
  ]);

  const countFor = (value: ReviewStatus) =>
    counts.find((row) => row.status === value)?._count ?? 0;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Moderation"
        title="Reviews"
        description="Approve or reject submitted reviews. Review text is never editable here."
        actions={
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((value) => (
              <Link
                key={value}
                href={`/admin/reviews?status=${value}`}
                className={cn(
                  "border-[3px] border-ink px-3 py-2 text-xs font-bold uppercase shadow-hard-xs",
                  status === value ? "bg-lemon" : "bg-paper hover:bg-butter",
                )}
              >
                {value} ({countFor(value)})
              </Link>
            ))}
          </div>
        }
      />

      {reviews.length === 0 ? (
        <EmptyState
          eyebrow={status}
          title={`No ${status.toLowerCase()} reviews`}
          description={
            status === "PENDING"
              ? "New reviews submitted on the site appear here for approval."
              : "Nothing in this bucket yet."
          }
          icon={<Star aria-hidden="true" className="size-8" />}
        />
      ) : (
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-bold">{row.name}</span>
                  {row.context ? (
                    <span className="mt-0.5 block text-xs text-ink-soft">
                      {row.context}
                    </span>
                  ) : null}
                  <Badge
                    variant={statusVariant[row.status]}
                    size="sm"
                    className="mt-1"
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-display text-lg">{row.rating}/5</TableCell>
                <TableCell className="max-w-md">
                  <p className="line-clamp-4 whitespace-pre-wrap text-sm">
                    {row.comment}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-ink-soft">
                  {formatDate(row.createdAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {row.approvedAt ? (
                    <span className="mt-0.5 block">
                      approved {formatDate(row.approvedAt, {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <ReviewRowActions
                      reviewId={row.id}
                      reviewName={row.name}
                      status={row.status}
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
