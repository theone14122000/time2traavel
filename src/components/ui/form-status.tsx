"use client";

import * as React from "react";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form-level status helpers. Deliberately dumb — no form context required —
 * so they can sit next to any react-hook-form form, server-action result or
 * plain HTML form.
 */

export type FormStatusType = "error" | "success" | "info";

export interface FormLiveRegionProps {
  /** Copy to announce. Empty/undefined clears the region without unmounting it. */
  message?: string | null;
  /** Chooses colour + icon. Default "info". */
  type?: FormStatusType;
  /** `true` (default) announces politely; `false` uses `role="alert"`. */
  polite?: boolean;
  id?: string;
  /** Extra classes for the message itself (not the live region wrapper). */
  className?: string;
}

/**
 * Persistent `aria-live` region that renders error/success copy with an icon.
 *
 * The wrapper stays mounted while `message` is empty, so screen readers pick
 * up every change to its contents.
 *
 * @example
 * ```tsx
 * <FormLiveRegion message={status.message} type={status.type} />
 * <FormLiveRegion message="Enquiry sent — we will be in touch." type="success" />
 * ```
 */
export function FormLiveRegion({
  message,
  type = "info",
  polite = true,
  id,
  className,
}: FormLiveRegionProps) {
  const Icon = type === "error" ? TriangleAlert : type === "success" ? CircleCheck : Info;

  return (
    <div
      id={id}
      role={polite ? "status" : "alert"}
      aria-live={polite ? "polite" : "assertive"}
      aria-atomic="true"
    >
      {message ? (
        <p
          className={cn(
            "inline-flex items-start gap-2 border-[3px] border-ink px-3 py-2 text-sm font-bold leading-snug",
            type === "error" && "bg-danger text-paper",
            type === "success" && "bg-mint text-ink",
            type === "info" && "bg-sky text-ink",
            className,
          )}
        >
          <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}

export interface SubmitErrorProps {
  /** Top-level message (e.g. a server action's `error` string). */
  error?: string | null;
  /** Per-field messages keyed by field name — matches action `fieldErrors`. */
  fieldErrors?: Record<string, string[] | string | null | undefined> | null;
  /** Human labels for field names, used in the link copy (e.g. { email: "Email" }). */
  fieldLabels?: Record<string, string>;
  /** DOM ids for the fields, keyed by field name. Defaults to the field name. */
  fieldIds?: Record<string, string>;
  /** Summary heading. Default "Something went wrong". */
  title?: string;
  className?: string;
}

function normalizeFieldErrors(
  fieldErrors: SubmitErrorProps["fieldErrors"],
): { field: string; message: string }[] {
  const entries: { field: string; message: string }[] = [];
  if (!fieldErrors) return entries;

  for (const [field, raw] of Object.entries(fieldErrors)) {
    const message = Array.isArray(raw) ? raw[0] : raw;
    if (typeof message === "string" && message.trim().length > 0) {
      entries.push({ field, message });
    }
  }
  return entries;
}

/**
 * Brutalist error summary: a top-level message plus a list of field errors
 * that link (and jump/focus) to the offending inputs.
 *
 * @example
 * ```tsx
 * <SubmitError
 *   error={result.error}
 *   fieldErrors={result.fieldErrors}
 *   fieldLabels={{ email: "Email", phone: "Phone" }}
 *   fieldIds={{ email: "contact-email" }}
 * />
 * ```
 */
export function SubmitError({
  error,
  fieldErrors,
  fieldLabels,
  fieldIds,
  title = "Something went wrong",
  className,
}: SubmitErrorProps) {
  const entries = React.useMemo(() => normalizeFieldErrors(fieldErrors), [fieldErrors]);
  const topError = typeof error === "string" && error.trim().length > 0 ? error : null;

  if (!topError && entries.length === 0) return null;

  const focusField = (event: React.MouseEvent<HTMLAnchorElement>, fieldId: string) => {
    const target = document.getElementById(fieldId);
    if (!target) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div
      role="alert"
      className={cn(
        "border-[3px] border-ink bg-danger p-4 text-paper shadow-brutal-sm",
        className,
      )}
    >
      <p className="flex items-center gap-2 font-display text-h4 uppercase">
        <TriangleAlert aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.5} />
        {title}
      </p>

      {topError ? <p className="mt-2 text-sm font-semibold">{topError}</p> : null}

      {entries.length > 0 ? (
        <ul className="mt-3 grid gap-1.5">
          {entries.map(({ field, message }) => {
            const fieldId = fieldIds?.[field] ?? field;
            const label = fieldLabels?.[field];
            return (
              <li key={field} className="text-sm">
                <a
                  href={`#${fieldId}`}
                  onClick={(event) => focusField(event, fieldId)}
                  className="font-semibold underline underline-offset-4 hover:bg-lemon hover:text-ink"
                >
                  {label ? `${label}: ${message}` : message}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
