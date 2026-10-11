import { NextResponse } from "next/server";
import { getPublishedDestinations } from "@/lib/data/destinations";
import { getPackages } from "@/lib/data/packages";

export const runtime = "nodejs";

const MIN_QUERY_LENGTH = 2;
const MAX_HITS = 6;

/**
 * Public search for the command palette: published destinations + packages.
 * No auth — only published content ever leaves the database. Fails safe to
 * empty arrays instead of a 5xx.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ destinations: [], packages: [] });
  }

  const needle = query.toLowerCase();

  try {
    const [allDestinations, packageResult] = await Promise.all([
      getPublishedDestinations(),
      getPackages({ filters: { search: query }, pageSize: MAX_HITS }),
    ]);

    const destinations = allDestinations
      .filter(
        (destination) =>
          destination.name.toLowerCase().includes(needle) ||
          destination.state.toLowerCase().includes(needle),
      )
      .slice(0, MAX_HITS)
      .map((destination) => ({
        slug: destination.slug,
        name: destination.name,
        state: destination.state,
      }));

    const packages = packageResult.items.slice(0, MAX_HITS).map((pkg) => ({
      slug: pkg.slug,
      title: pkg.title,
      durationDays: pkg.durationDays,
      price: pkg.price,
      currency: pkg.currency,
    }));

    return NextResponse.json({ destinations, packages });
  } catch (error) {
    console.error("[api:search] failed:", error);
    return NextResponse.json({ destinations: [], packages: [] });
  }
}
