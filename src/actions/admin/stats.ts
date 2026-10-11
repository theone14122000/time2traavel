import "server-only";
import { prisma } from "@/lib/prisma";
import {
  INQUIRY_STATUSES,
  INQUIRY_TYPES,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { safeAdminQuery } from "@/actions/admin/shared";

export type AdminStats = {
  destinations: { total: number; published: number };
  packages: { total: number; published: number };
  reviews: { pending: number; approved: number; rejected: number };
  inquiries: {
    new: number;
    contacted: number;
    closed: number;
    total: number;
  };
  subscribers: { total: number; active: number };
  recentInquiries: {
    id: string;
    name: string;
    email: string;
    typeLabel: string;
    subject: string;
    status: string;
    statusLabel: string;
    createdAt: string;
  }[];
  pendingReviews: {
    id: string;
    name: string;
    context: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
};

const EMPTY_STATS: AdminStats = {
  destinations: { total: 0, published: 0 },
  packages: { total: 0, published: 0 },
  reviews: { pending: 0, approved: 0, rejected: 0 },
  inquiries: { new: 0, contacted: 0, closed: 0, total: 0 },
  subscribers: { total: 0, active: 0 },
  recentInquiries: [],
  pendingReviews: [],
};

/** Real counts only — no invented metrics, no synthetic charts. */
export async function getAdminStats(): Promise<AdminStats> {
  return safeAdminQuery(
    "stats",
    async () => {
      const [
        destinationTotal,
        destinationPublished,
        packageTotal,
        packagePublished,
        reviewPending,
        reviewApproved,
        reviewRejected,
        inquiryNew,
        inquiryContacted,
        inquiryClosed,
        inquiryTotal,
        subscriberTotal,
        subscriberActive,
        recentInquiries,
        pendingReviews,
      ] = await Promise.all([
        prisma.destination.count(),
        prisma.destination.count({ where: { published: true } }),
        prisma.package.count(),
        prisma.package.count({ where: { published: true } }),
        prisma.review.count({ where: { status: "PENDING" } }),
        prisma.review.count({ where: { status: "APPROVED" } }),
        prisma.review.count({ where: { status: "REJECTED" } }),
        prisma.inquiry.count({ where: { status: "NEW" } }),
        prisma.inquiry.count({ where: { status: "CONTACTED" } }),
        prisma.inquiry.count({ where: { status: "CLOSED" } }),
        prisma.inquiry.count(),
        prisma.newsletterSubscriber.count(),
        prisma.newsletterSubscriber.count({ where: { active: true } }),
        prisma.inquiry.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            subject: true,
            message: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.review.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            context: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        destinations: { total: destinationTotal, published: destinationPublished },
        packages: { total: packageTotal, published: packagePublished },
        reviews: {
          pending: reviewPending,
          approved: reviewApproved,
          rejected: reviewRejected,
        },
        inquiries: {
          new: inquiryNew,
          contacted: inquiryContacted,
          closed: inquiryClosed,
          total: inquiryTotal,
        },
        subscribers: { total: subscriberTotal, active: subscriberActive },
        recentInquiries: recentInquiries.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          typeLabel: INQUIRY_TYPES[row.type] ?? row.type,
          subject: row.subject || row.message?.slice(0, 80) || "—",
          status: row.status,
          statusLabel: INQUIRY_STATUSES[row.status] ?? row.status,
          createdAt: formatDate(row.createdAt, {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
        pendingReviews: pendingReviews.map((row) => ({
          id: row.id,
          name: row.name,
          context: row.context ?? "",
          rating: row.rating,
          comment:
            row.comment.length > 140 ? `${row.comment.slice(0, 140)}…` : row.comment,
          createdAt: formatDate(row.createdAt, {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        })),
      };
    },
    EMPTY_STATS,
  );
}
