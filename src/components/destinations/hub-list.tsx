import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { DestinationGrid } from "@/components/home/destination-grid";
import { cn, pluralize } from "@/lib/utils";
import type { DestinationCard as DestinationData } from "@/lib/data/destinations";

export type DestinationHubTab = "all" | "domestic" | "international";

const TABS: { key: DestinationHubTab; href: string; label: string }[] = [
  { key: "all", href: "/destinations", label: "All" },
  { key: "domestic", href: "/destinations/domestic", label: "Domestic" },
  { key: "international", href: "/destinations/international", label: "International" },
];

/**
 * All | Domestic | International switcher — plain links (works without JS).
 */
export function DestinationHubTabs({ active }: { active: DestinationHubTab }) {
  return (
    <nav
      aria-label="Destination scope"
      className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "label-brutal tap-44 inline-flex shrink-0 items-center border border-line px-3.5 py-2.5 transition-all",
              isActive
                ? "bg-lemon shadow-hard-xs"
                : "bg-paper shadow-hard-xs hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-butter",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Published destinations for a scope. `isInternational` is the admin flag;
 * no flag means domestic unless the slug says otherwise.
 */
export async function getHubDestinations(
  scope: Exclude<DestinationHubTab, "all">,
): Promise<DestinationData[]> {
  return safeQuery(
    `destinations.hub.${scope}`,
    () =>
      prisma.destination.findMany({
        where: {
          published: true,
          isInternational: scope === "international",
        },
        select: {
          id: true,
          slug: true,
          name: true,
          state: true,
          region: true,
          summary: true,
          image: true,
          imageAlt: true,
          featured: true,
          order: true,
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    [],
  );
}

/**
 * Shared listing shell for /destinations/domestic and
 * /destinations/international — scope tabs, live count and the
 * filterable card grid.
 */
export function DestinationHubList({
  destinations,
  active,
}: {
  destinations: DestinationData[];
  active: DestinationHubTab;
}) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DestinationHubTabs active={active} />
        <p role="status" aria-live="polite" className="label-brutal shrink-0 text-ink-soft">
          {pluralize(destinations.length, "published destination")}
        </p>
      </div>

      <DestinationGrid destinations={destinations} showViewAll={false} />
    </div>
  );
}
