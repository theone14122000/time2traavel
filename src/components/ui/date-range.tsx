"use client";

import * as React from "react";
import { CalendarDays, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Controlled From/To date pair in a bordered panel.
 *
 * The To date can never land before the From date: picking an earlier return
 * date keeps the previous value and surfaces an error message instead, and
 * moving From past To silently clears To. Both inputs also honour `min`/`max`
 * so the native date picker refuses out-of-range days.
 *
 * Values are ISO strings (`YYYY-MM-DD`, `""` when unset) so they drop straight
 * into react-hook-form / server actions.
 *
 * @example
 * ```tsx
 * <DateRange
 *   label="Travel dates"
 *   min={todayIso}
 *   value={dates}
 *   onChange={setDates}
 * />
 *
 * // …inside react-hook-form:
 * <DateRange
 *   value={{ from: field.from, to: field.to }}
 *   onChange={(next) => {
 *     field.onChange(next);
 *     setValue("to", next.to);
 *   }}
 * />
 * ```
 */
export interface DateRangeValue {
  /** Departure date as `YYYY-MM-DD`, or "" when unset. */
  from: string;
  /** Return date as `YYYY-MM-DD`, or "" when unset. */
  to: string;
}

export interface DateRangeProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Panel title. Default "Travel dates". */
  label?: React.ReactNode;
  /** Caption for the first input. Default "From". */
  fromLabel?: string;
  /** Caption for the second input. Default "To". */
  toLabel?: string;
  /** Earliest selectable date (`YYYY-MM-DD`). */
  min?: string;
  /** Latest selectable date (`YYYY-MM-DD`). */
  max?: string;
  disabled?: boolean;
  /** External validation copy (shown alongside the built-in range check). */
  error?: string | null;
  /** Copy for the built-in "To before From" guard. */
  invalidMessage?: string;
  /** Copy for the clear button. Default "Clear dates". */
  clearLabel?: string;
  /** Called after the built-in clear (both dates emptied). */
  onClear?: () => void;
  /** DOM id for the wrapper (aria wiring is generated from it). */
  id?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

export function DateRange({
  value,
  onChange,
  label = "Travel dates",
  fromLabel = "From",
  toLabel = "To",
  min,
  max,
  disabled,
  error,
  invalidMessage = "End date must be on or after start date.",
  clearLabel = "Clear dates",
  onClear,
  id,
  className,
}: DateRangeProps) {
  const reactId = React.useId();
  const baseId = id ?? reactId;
  const fromId = `${baseId}-from`;
  const toId = `${baseId}-to`;
  const errorId = `${baseId}-error`;

  const from = value?.from ?? "";
  const to = value?.to ?? "";

  const [attemptError, setAttemptError] = React.useState<string | null>(null);

  const externalError =
    typeof error === "string" && error.trim().length > 0 ? error : null;
  const rangeInvalid = !!from && !!to && to < from;
  const message = attemptError ?? externalError ?? (rangeInvalid ? invalidMessage : null);
  const hasError = !!message;
  const describedBy = hasError ? errorId : undefined;

  const handleFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFrom = event.target.value;
    setAttemptError(null);
    onChange({
      from: nextFrom,
      to: to && nextFrom && to < nextFrom ? "" : to,
    });
  };

  const handleToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTo = event.target.value;
    if (from && nextTo && nextTo < from) {
      setAttemptError(invalidMessage);
      return;
    }
    setAttemptError(null);
    onChange({ from, to: nextTo });
  };

  const handleClear = () => {
    setAttemptError(null);
    onChange({ from: "", to: "" });
    onClear?.();
  };

  const isPristine = !from && !to;

  return (
    <div
      id={id}
      data-invalid={hasError ? "true" : undefined}
      className={cn(
        "border border-line bg-paper p-4 shadow-hard-sm",
        "data-[invalid=true]:border-danger",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line pb-3">
        <span className="flex items-center gap-2 font-display text-h4 uppercase">
          <CalendarDays aria-hidden="true" className="size-5" />
          {label}
        </span>
        <button
          type="button"
          disabled={disabled || isPristine}
          onClick={handleClear}
          className="tap-44 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:text-tomato disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X aria-hidden="true" className="size-3.5" strokeWidth={3} />
          {clearLabel}
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={fromId}>{fromLabel}</Label>
          <Input
            id={fromId}
            type="date"
            value={from}
            min={min}
            max={to || max}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            onChange={handleFromChange}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={toId}>{toLabel}</Label>
          <Input
            id={toId}
            type="date"
            value={to}
            min={from || min}
            max={max}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            onChange={handleToChange}
          />
        </div>
      </div>

      {message ? (
        <p id={errorId} className="mt-3 break-words text-xs font-semibold text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
