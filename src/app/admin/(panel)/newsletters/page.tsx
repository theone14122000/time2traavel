import type { Metadata } from "next";
import { Download, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteSubscriberAction, toggleSubscriberAction } from "@/actions/admin/newsletter";
import { safeAdminQuery } from "@/actions/admin/shared";
import { formatDate } from "@/lib/utils";
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
  title: "Newsletter",
  robots: { index: false, follow: false },
};

export default async function AdminNewslettersPage() {
  const subscribers = await safeAdminQuery(
    "admin.newsletter.list",
    () =>
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    [],
  );

  const activeCount = subscribers.filter((row) => row.active).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Audience"
        title="Newsletter subscribers"
        description={`${subscribers.length} total · ${activeCount} active. Export the list for your email tool.`}
        actions={
          <Button asChild variant="dark" size="lg">
            <a href="/api/admin/newsletters/export" download>
              <Download aria-hidden="true" className="size-4" />
              Export CSV
            </a>
          </Button>
        }
      />

      {subscribers.length === 0 ? (
        <EmptyState
          eyebrow="No subscribers"
          title="Nobody signed up yet"
          description="The footer newsletter form on the public site adds subscribers here."
          icon={<Newspaper aria-hidden="true" className="size-8" />}
        />
      ) : (
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-bold">{row.email}</TableCell>
                <TableCell>
                  <Badge variant={row.active ? "success" : "outline"} size="sm">
                    {row.active ? "Active" : "Paused"}
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
                    <AsyncButton
                      variant="soft"
                      size="sm"
                      onAction={toggleSubscriberAction.bind(null, row.id)}
                    >
                      {row.active ? "Pause" : "Resume"}
                    </AsyncButton>
                    <ConfirmDeleteButton
                      onAction={deleteSubscriberAction.bind(null, row.id)}
                      confirmTitle={`Remove ${row.email}?`}
                      confirmDescription="They will be deleted from the list — they can re-subscribe via the site."
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
