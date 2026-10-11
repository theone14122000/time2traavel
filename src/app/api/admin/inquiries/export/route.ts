import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { toCsv } from "@/lib/utils";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * Authenticated CSV export of every enquiry.
 * Linked as `<a href="/api/admin/inquiries/export" download>`.
 */
export async function GET() {
  await requireAdmin();

  let csv = "";
  try {
    const rows = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    const packageIds = Array.from(
      new Set(
        rows.map((row) => row.packageId).filter((v): v is string => Boolean(v)),
      ),
    );
    const destinationIds = Array.from(
      new Set(
        rows
          .map((row) => row.destinationId)
          .filter((v): v is string => Boolean(v)),
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
    const destinationNames = new Map(
      destinations.map((row) => [row.id, row.name]),
    );

    csv = toCsv(
      rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.toISOString(),
        type: INQUIRY_TYPES[row.type] ?? row.type,
        status: INQUIRY_STATUSES[row.status] ?? row.status,
        name: row.name,
        email: row.email,
        phone: row.phone ?? "",
        subject: row.subject ?? "",
        message: row.message ?? "",
        package: row.packageId ? packageTitles.get(row.packageId) ?? "" : "",
        destination: row.destinationId
          ? destinationNames.get(row.destinationId) ?? ""
          : "",
        travelDate: row.travelDate ? row.travelDate.toISOString().slice(0, 10) : "",
        endDate: row.endDate ? row.endDate.toISOString().slice(0, 10) : "",
        travellers: row.travellers ?? "",
        budgetRange: row.budgetRange ?? "",
        tripType: row.tripType ?? "",
        specialRequests: row.specialRequests ?? "",
        adminNotes: row.adminNotes ?? "",
      })),
    );
  } catch (error) {
    console.error("[admin:inquiries:export] failed:", error);
    return NextResponse.json(
      { error: "Export failed — the database is unavailable." },
      { status: 500 },
    );
  }

  const filename = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
