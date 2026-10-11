import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { toCsv } from "@/lib/utils";

export const runtime = "nodejs";

/** Authenticated CSV export of newsletter subscribers. */
export async function GET() {
  await requireAdmin();

  let csv = "";
  try {
    const rows = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    csv = toCsv(
      rows.map((row) => ({
        id: row.id,
        email: row.email,
        active: row.active ? "yes" : "no",
        subscribedAt: row.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("[admin:newsletter:export] failed:", error);
    return NextResponse.json(
      { error: "Export failed — the database is unavailable." },
      { status: 500 },
    );
  }

  const filename = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
