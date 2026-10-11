import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/actions/admin/shared";
import { formatDate, formatDateRange } from "@/lib/utils";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "@/lib/constants";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { InquiryStatusForm } from "@/components/admin/inquiry-status-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Enquiry",
  robots: { index: false, follow: false },
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="grid gap-1 border-b-[2px] border-ink/15 py-2.5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="label-brutal text-ink-soft">{label}</dt>
      <dd className="break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await safeAdminQuery(
    `admin.inquiries.detail:${id}`,
    () => prisma.inquiry.findUnique({ where: { id } }),
    null,
  );

  if (!inquiry) notFound();

  // Inquiry stores plain FK columns without a Prisma relation — fetch names.
  const [linkedPackage, linkedDestination] = await Promise.all([
    inquiry.packageId
      ? safeAdminQuery(
          `admin.inquiries.package:${inquiry.packageId}`,
          () =>
            prisma.package.findUnique({
              where: { id: inquiry.packageId as string },
              select: { id: true, title: true, slug: true },
            }),
          null,
        )
      : Promise.resolve(null),
    inquiry.destinationId
      ? safeAdminQuery(
          `admin.inquiries.destination:${inquiry.destinationId}`,
          () =>
            prisma.destination.findUnique({
              where: { id: inquiry.destinationId as string },
              select: { id: true, name: true, slug: true },
            }),
          null,
        )
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Enquiry"
        title={inquiry.name}
        description={`${INQUIRY_TYPES[inquiry.type] ?? inquiry.type} · received ${formatDate(inquiry.createdAt, { dateStyle: "full", timeStyle: "short" })}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="dark" size="lg">
              {INQUIRY_STATUSES[inquiry.status] ?? inquiry.status}
            </Badge>
            <Button asChild variant="outline">
              <Link href="/admin/inquiries">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Back to inbox
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Submission</CardTitle>
            <CardDescription>Exactly what the visitor sent.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Name" value={inquiry.name} />
              <DetailRow label="Email" value={inquiry.email} />
              <DetailRow label="Phone" value={inquiry.phone} />
              <DetailRow label="Subject" value={inquiry.subject} />
              <DetailRow label="Message" value={inquiry.message} />
              <DetailRow
                label="Package"
                value={
                  linkedPackage ? (
                    <Link
                      href={`/admin/packages/${linkedPackage.id}`}
                      className="font-bold underline underline-offset-4 hover:bg-lemon"
                    >
                      {linkedPackage.title}
                    </Link>
                  ) : null
                }
              />
              <DetailRow
                label="Destination"
                value={
                  linkedDestination ? (
                    <Link
                      href={`/admin/destinations/${linkedDestination.id}`}
                      className="font-bold underline underline-offset-4 hover:bg-lemon"
                    >
                      {linkedDestination.name}
                    </Link>
                  ) : null
                }
              />
              <DetailRow
                label="Travel dates"
                value={formatDateRange(inquiry.travelDate, inquiry.endDate) || null}
              />
              <DetailRow
                label="Travellers"
                value={inquiry.travellers?.toString() ?? null}
              />
              <DetailRow label="Budget" value={inquiry.budgetRange} />
              <DetailRow label="Trip type" value={inquiry.tripType} />
              <DetailRow label="Special requests" value={inquiry.specialRequests} />
              <DetailRow
                label="Received"
                value={formatDate(inquiry.createdAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
              <DetailRow label="User agent" value={inquiry.userAgent} />
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Update enquiry</CardTitle>
              <CardDescription>
                Move it through NEW → CONTACTED → CLOSED and keep internal notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InquiryStatusForm
                inquiry={{
                  id: inquiry.id,
                  status: inquiry.status,
                  adminNotes: inquiry.adminNotes,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="soft">
                <a href={`mailto:${inquiry.email}`}>
                  Email {inquiry.email}
                </a>
              </Button>
              {inquiry.phone ? (
                <Button asChild variant="outline">
                  <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}>
                    Call {inquiry.phone}
                  </a>
                </Button>
              ) : null}
              <Separator />
              <p className="text-xs font-semibold text-ink-soft">
                Status changes and notes are saved together — the visitor is
                never notified automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
