import {
  Compass,
  Heart,
  Map as MapIcon,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";

export type ValueItem = {
  title: string;
  description: string;
  icon?: string;
};

/**
 * The only icon names an admin may use in `data[].icon`. Anything else
 * (including an omitted icon) falls back to a plain square.
 */
const ICON_WHITELIST = {
  Map: MapIcon,
  Compass,
  Users,
  Heart,
  Star,
  Shield,
} as const;

type IconName = keyof typeof ICON_WHITELIST;

/** Palette rotation for the icon boxes — one tone per tile, in order. */
const TILE_TONES = [
  "bg-mint",
  "bg-sky",
  "bg-peach",
  "bg-lavender",
  "bg-blush",
  "bg-butter",
] as const;

/**
 * Reads the values grid from admin-managed `PageContent.data`.
 * Returns `null` unless `data` is a non-empty array of usable objects, so the
 * caller can fall back to the plain mission paragraph rendering.
 *
 * Expected shape: `Array<{ title: string; description: string; icon?: string }>`
 */
export function parseValues(data: unknown): ValueItem[] | null {
  if (!Array.isArray(data)) return null;

  const values: ValueItem[] = [];

  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;

    const title = typeof record.title === "string" ? record.title.trim() : "";
    if (!title) continue;

    const description =
      typeof record.description === "string" ? record.description.trim() : "";
    const icon = typeof record.icon === "string" ? record.icon.trim() : "";

    values.push({
      title,
      description,
      ...(icon ? { icon } : {}),
    });
  }

  return values.length > 0 ? values : null;
}

function ValueIcon({ name }: { name?: string }) {
  const key = name?.trim() as IconName | undefined;
  const Icon = key ? ICON_WHITELIST[key] : undefined;

  if (!Icon) {
    return (
      <span
        aria-hidden="true"
        className="block size-4 border border-line bg-ink"
      />
    );
  }

  return <Icon aria-hidden="true" className="size-6" strokeWidth={2.5} />;
}

/**
 * Values grid built from `about.mission` when it is structured data.
 * Rotating palette icon boxes + hard-shadow paper tiles.
 */
export function ValuesGrid({ values }: { values: ValueItem[] }) {
  if (values.length === 0) return null;

  return (
    <StaggerGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {values.map((value, index) => (
        <StaggerItem key={`${value.title}-${index}`} className="h-full">
          <article className="flex h-full flex-col border border-line bg-paper p-5 shadow-brutal-md transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg sm:p-6">
            <span
              aria-hidden="true"
              className={cn(
                "flex size-12 shrink-0 items-center justify-center border border-line",
                TILE_TONES[index % TILE_TONES.length],
              )}
            >
              <ValueIcon name={value.icon} />
            </span>

            <h3 className="mt-4 font-display text-h4 uppercase leading-tight">
              {value.title}
            </h3>

            {value.description ? (
              <p className="mt-3 text-sm font-medium leading-relaxed text-ink-soft">
                {value.description}
              </p>
            ) : null}
          </article>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
