import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Inbox, MapPin, Package, Star } from "lucide-react";
import { getAdminStats } from "@/actions/admin/stats";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const statusVariant = {
  NEW: "default",
  CONTACTED: "sky",
  CLOSED: "outline",
} as const;

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Live counts from the database — no estimates, no vanity metrics."
        actions={
          <Badge variant="dark" size="lg">
            {stats.inquiries.new} new {stats.inquiries.new === 1 ? "enquiry" : "enquiries"}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Destinations"
          value={stats.destinations.total}
          hint={`${stats.destinations.published} published`}
          tone="butter"
        />
        <StatCard
          label="Packages"
          value={stats.packages.total}
          hint={`${stats.packages.published} published`}
          tone="mint"
        />
        <StatCard
          label="Reviews pending"
          value={stats.reviews.pending}
          hint={`${stats.reviews.approved} approved · ${stats.reviews.rejected} rejected`}
          tone="lavender"
        />
        <StatCard
          label="Newsletter"
          value={stats.subscribers.total}
          hint={`${stats.subscribers.active} active`}
          tone="sky"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="New enquiries"
          value={stats.inquiries.new}
          hint="Awaiting first response"
          tone="paper"
        />
        <StatCard
          label="Contacted"
          value={stats.inquiries.contacted}
          hint="In progress"
          tone="paper"
        />
        <StatCard
          label="Closed"
          value={stats.inquiries.closed}
          hint={`${stats.inquiries.total} total`}
          tone="paper"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Recent enquiries</CardTitle>
                <CardDescription>Latest five submissions.</CardDescription>
              </div>
              <Link
                href="/admin/inquiries"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase underline underline-offset-4"
              >
                All
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentInquiries.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  eyebrow="Inbox zero"
                  title="No enquiries yet"
                  description="Submitted contact and trip-planning forms land here."
                  icon={<Inbox aria-hidden="true" className="size-8" />}
                />
              </div>
            ) : (
              <ul className="divide-y-[3px] divide-ink">
                {stats.recentInquiries.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`/admin/inquiries/${row.id}`}
                      className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-butter/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-bold">{row.name}</p>
                        <p className="truncate text-xs text-ink-soft">
                          {row.typeLabel} · {row.subject}
                        </p>
                        <p className="mt-1 text-[0.7rem] font-semibold uppercase text-ink-soft">
                          {row.createdAt}
                        </p>
                      </div>
                      <Badge
                        variant={statusVariant[row.status as keyof typeof statusVariant] ?? "soft"}
                        size="sm"
                      >
                        {row.statusLabel}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Reviews awaiting approval</CardTitle>
                <CardDescription>Approve to show them publicly.</CardDescription>
              </div>
              <Link
                href="/admin/reviews"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase underline underline-offset-4"
              >
                All
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stats.pendingReviews.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  eyebrow="All clear"
                  title="Nothing pending"
                  description="New reviews from the site show up here for approval."
                  tone="mint"
                  icon={<Star aria-hidden="true" className="size-8" />}
                />
              </div>
            ) : (
              <ul className="divide-y-[3px] divide-ink">
                {stats.pendingReviews.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {row.name}
                        {row.context ? (
                          <span className="ml-2 text-xs font-semibold text-ink-soft">
                            · {row.context}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                        {row.comment}
                      </p>
                      <p className="mt-1 text-[0.7rem] font-semibold uppercase text-ink-soft">
                        {row.rating}/5 · {row.createdAt}
                      </p>
                    </div>
                    <Badge variant="lavender" size="sm">
                      Pending
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/destinations/new"
          className="inline-flex items-center gap-2 border-[3px] border-ink bg-lemon px-4 py-3 text-xs font-bold uppercase shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <MapPin aria-hidden="true" className="size-4" />
          New destination
        </Link>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 border-[3px] border-ink bg-mint px-4 py-3 text-xs font-bold uppercase shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <Package aria-hidden="true" className="size-4" />
          New package
        </Link>
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-2 border-[3px] border-ink bg-sky px-4 py-3 text-xs font-bold uppercase shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <Inbox aria-hidden="true" className="size-4" />
          Open enquiries
        </Link>
      </div>
    </div>
  );
}
