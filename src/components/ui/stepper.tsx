"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Controlled +/- counter for traveller counts (or any small integer).
 *
 * Minus/plus are real 44px buttons; the readonly count is an `<output>` so
 * screen readers announce every change politely. An optional hidden input
 * carries the value into native `<form>` posts when `name` is given.
 *
 * @example
 * ```tsx
 * const [travellers, setTravellers] = useState(2);
 *
 * <TravellerStepper
 *   label="Travellers"
 *   unit="travellers"
 *   min={1}
 *   max={12}
 *   value={travellers}
 *   onChange={setTravellers}
 * />
 *
 * // …or wire it straight into react-hook-form:
 * <TravellerStepper
 *   name="travellers"
 *   label="Travellers"
 *   value={watch("travellers")}
 *   onChange={(next) => setValue("travellers", next, { shouldDirty: true })}
 * />
 * ```
 */
export interface TravellerStepperProps {
  /** Current count (controlled). Clamped to `[min, max]` for display. */
  value: number;
  /** Called with the clamped next count whenever a step button is pressed. */
  onChange: (value: number) => void;
  /** Visible field label, e.g. "Travellers". */
  label?: React.ReactNode;
  /** Noun announced by screen readers after the number (e.g. "travellers"). */
  unit?: string;
  /** Lower bound (inclusive). Default 1. */
  min?: number;
  /** Upper bound (inclusive). Default 20. */
  max?: number;
  /** Increment applied per press. Default 1. */
  step?: number;
  /** When set, a hidden input posts the value from plain HTML forms. */
  name?: string;
  /** DOM id for the control wrapper (also used for aria wiring). */
  id?: string;
  disabled?: boolean;
  /** Short helper copy rendered above the control. */
  description?: string;
  /** Validation copy. Marks the control invalid and is linked via aria-describedby. */
  error?: string | null;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

export function TravellerStepper({
  value,
  onChange,
  label,
  unit,
  min = 1,
  max = 20,
  step = 1,
  name,
  id,
  disabled,
  description,
  error,
  className,
}: TravellerStepperProps) {
  const reactId = React.useId();
  const stepperId = id ?? reactId;
  const labelId = `${stepperId}-label`;
  const descId = `${stepperId}-description`;
  const errorId = `${stepperId}-error`;

  const lo = Number.isFinite(min) ? min : 1;
  const hi = Math.max(Number.isFinite(max) ? max : 20, lo);
  const stride = Math.max(Number.isFinite(step) ? step : 1, 1);

  const clamp = (next: number) => Math.min(Math.max(next, lo), hi);
  const current = clamp(value);
  const atMin = current <= lo;
  const atMax = current >= hi;

  const message = typeof error === "string" && error.trim().length > 0 ? error : null;
  const hasError = !!message;
  const describedBy =
    [description ? descId : null, message ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const labelText = typeof label === "string" ? label.trim() : "";
  const decreaseLabel = labelText ? `Decrease ${labelText}` : "Decrease";
  const increaseLabel = labelText ? `Increase ${labelText}` : "Increase";

  const buttonClasses = cn(
    "tap-44 flex size-11 shrink-0 items-center justify-center bg-paper text-ink transition-colors",
    "hover:bg-butter active:bg-lemon disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper",
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        {label ? (
          <span id={labelId} className="label-brutal text-ink">
            {label}
          </span>
        ) : null}
        {description ? (
          <span id={descId} className="text-xs font-medium text-ink-soft">
            {description}
          </span>
        ) : null}
      </div>

      <div
        id={stepperId}
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        data-invalid={hasError ? "true" : undefined}
        className={cn(
          "flex w-fit items-stretch border bg-paper shadow-brutal-sm",
          hasError ? "border-danger" : "border-line",
          disabled && "opacity-50",
        )}
      >
        <button
          type="button"
          aria-label={decreaseLabel}
          disabled={disabled || atMin}
          onClick={() => onChange(clamp(current - stride))}
          className={cn(buttonClasses, "border-r border-line")}
        >
          <Minus aria-hidden="true" className="size-4" strokeWidth={3} />
        </button>

        <output
          aria-live="polite"
          className="flex min-w-16 items-center justify-center px-3 font-display text-h4 tabular-nums"
        >
          {current}
          {unit ? <span className="sr-only"> {unit}</span> : null}
        </output>

        <button
          type="button"
          aria-label={increaseLabel}
          disabled={disabled || atMax}
          onClick={() => onChange(clamp(current + stride))}
          className={cn(buttonClasses, "border-l border-line")}
        >
          <Plus aria-hidden="true" className="size-4" strokeWidth={3} />
        </button>
      </div>

      {name ? <input type="hidden" name={name} value={current} readOnly /> : null}

      {message ? (
        <p id={errorId} className="break-words text-xs font-semibold text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
