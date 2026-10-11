import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function formatDate(
  date: Date | string | number | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", opts).format(d);
}

export function formatPrice(
  amount: number | null | undefined,
  currency = "INR",
): string {
  if (amount === null || amount === undefined) return "";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end?: Date | string | null,
): string {
  if (!start) return "";
  const a = formatDate(start, { day: "numeric", month: "short", year: "numeric" });
  if (!end) return a;
  const b = formatDate(end, { day: "numeric", month: "short", year: "numeric" });
  return `${a} – ${b}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Convert Prisma Json values into a plain string array (safe for lists). */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v : typeof v === "object" && v !== null && "title" in v ? String((v as { title: unknown }).title) : ""))
      .filter((v) => v.trim().length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,\s*/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export type SocialLink = { platform: string; url: string };

export function toSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is SocialLink =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as SocialLink).url === "string" &&
        typeof (v as SocialLink).platform === "string",
    )
    .map((v) => ({ platform: v.platform, url: v.url }))
    .filter((v) => v.url.trim().length > 0);
}

/** Read a JSON gallery field: [{url, alt}] */
export type GalleryImage = { url: string; alt: string };

export function toGallery(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is GalleryImage =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as GalleryImage).url === "string" &&
        (v as GalleryImage).url.trim().length > 0,
    )
    .map((v) => ({ url: v.url, alt: typeof v.alt === "string" ? v.alt : "" }));
}

/** Human readable duration label from day count. */
export function durationLabel(days: number, provided?: string | null): string {
  if (provided && provided.trim()) return provided;
  if (days <= 0) return "";
  const nights = Math.max(days - 1, 0);
  return `${days} Day${days > 1 ? "s" : ""} / ${nights} Night${nights === 1 ? "" : "s"}`;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

/** Stable, dependency-free CSV builder for admin exports. */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const escape = (value: unknown): string => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\r\n");
}
