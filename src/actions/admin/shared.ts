import "server-only";
import type { z } from "zod";

export type ActionSuccess = { ok: true; message: string };
export type ActionFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};
export type ActionResult = ActionSuccess | ActionFailure;

export function ok(message: string): ActionSuccess {
  return { ok: true, message };
}

export function failure(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionFailure {
  return { ok: false, error, fieldErrors };
}

export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/** Prisma "unique constraint" error code. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Same idea as `lib/data/safe` — admin READS never crash the panel when the
 * database is unreachable; they fall back to empty/zero data instead.
 */
export async function safeAdminQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[admin:${label}] ${errorMessage(error)}`);
    return fallback;
  }
}

/** Normalise a "one item per line" textarea into a clean string array. */
export function linesToArray(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Inverse of `linesToArray` for edit forms. */
export function arrayToLines(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((v) => (typeof v === "string" ? v : ""))
    .filter((v) => v.trim().length > 0)
    .join("\n");
}
