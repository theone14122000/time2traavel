"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Controlled budget range built from two native `input[type=range]` rows
 * (min + max) with `min <= max` clamping, brutalist borders, a tomato fill
 * and a square hard-shadowed thumb.
 *
 * Values are plain numbers — format them yourself with `format`, or pass
 * `prefix="₹"` to use the built-in Indian-grouping formatter.
 *
 * @example
 * ```tsx
 * <BudgetSlider
 *   label="Budget per person"
 *   min={0}
 *   max={100000}
 *   step={500}
 *   prefix="₹"
 *   value={budget}
 *   onChange={setBudget}
 * />
 *
 * // custom readout (e.g. compact labels):
 * <BudgetSlider
 *   min={0}
 *   max={500000}
 *   value={budget}
 *   onChange={setBudget}
 *   format={(n) => (n >= 1000 ? `${n / 1000}k` : String(n))}
 * />
 * ```
 */
export type BudgetRange = { min: number; max: number };

export interface BudgetSliderProps {
  /** Lower bound of the slider (inclusive). */
  min: number;
  /** Upper bound of the slider (inclusive). */
  max: number;
  /** Controlled selection — always reported with `value.min <= value.max`. */
  value: BudgetRange;
  onChange: (value: BudgetRange) => void;
  /** Granularity of each slider. Default 1. */
  step?: number;
  /** Formats a value for every readout. Defaults to a plain (grouped) number. */
  format?: (value: number) => string;
  /** Prefix for the default formatter, e.g. `"₹"`. Ignored when `format` is set. */
  prefix?: string;
  /** Group label shown above the sliders. */
  label?: React.ReactNode;
  /** Caption for the lower slider. Default "Min". */
  minLabel?: string;
  /** Caption for the upper slider. Default "Max". */
  maxLabel?: string;
  disabled?: boolean;
  /** Validation copy. Marks both sliders invalid and links the message. */
  error?: string | null;
  /** DOM id for the wrapper (aria wiring is generated from it). */
  id?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

const rangeInputClasses =
  "h-4 w-full cursor-pointer appearance-none border border-line " +
  "[&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:[-webkit-appearance:none] " +
  "[&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:border " +
  "[&::-webkit-slider-thumb]:border-line [&::-webkit-slider-thumb]:bg-lemon " +
  "[&::-webkit-slider-thumb]:shadow-hard [&::-webkit-slider-thumb]:mt-[-7px] " +
  "[&::-moz-range-track]:h-2.5 [&::-moz-range-track]:border-none [&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-none " +
  "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-line [&::-moz-range-thumb]:bg-lemon " +
  "[&::-moz-range-thumb]:shadow-hard";

function fillStyle(percent: number): React.CSSProperties {
  return {
    background: `linear-gradient(to right, var(--color-tomato) ${percent}%, var(--color-sand) ${percent}%)`,
  };
}

function RangeRow({
  rowId,
  rowLabel,
  rowValue,
  percent,
  min,
  max,
  step,
  disabled,
  hasError,
  describedBy,
  formatValue,
  onRowChange,
}: {
  rowId: string;
  rowLabel: string;
  rowValue: number;
  percent: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
  formatValue: (value: number) => string;
  onRowChange: (next: number) => void;
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-3">
        <span id={rowId} className="label-brutal text-ink-soft">
          {rowLabel}
        </span>
        <span className="rounded-chip border border-line bg-sunrise px-2 py-1 text-xs font-bold tabular-nums">
          {formatValue(rowValue)}
        </span>
      </div>
      <div className="flex h-11 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={rowValue}
          disabled={disabled}
          aria-labelledby={rowId}
          aria-valuetext={formatValue(rowValue)}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          onChange={(event) => onRowChange(Number(event.target.value))}
          style={fillStyle(percent)}
          className={cn(
            rangeInputClasses,
            disabled && "cursor-not-allowed opacity-50",
          )}
        />
      </div>
    </div>
  );
}

export function BudgetSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  format,
  prefix,
  label,
  minLabel = "Min",
  maxLabel = "Max",
  disabled,
  error,
  id,
  className,
}: BudgetSliderProps) {
  const reactId = React.useId();
  const baseId = id ?? reactId;
  const labelId = `${baseId}-label`;
  const errorId = `${baseId}-error`;

  const lo = Number.isFinite(min) ? min : 0;
  const hi = Math.max(Number.isFinite(max) ? max : 0, lo);
  const span = Math.max(hi - lo, 1);

  const clamp = (next: number) => Math.min(Math.max(next, lo), hi);
  let selMin = clamp(value?.min ?? lo);
  let selMax = clamp(value?.max ?? hi);
  if (selMin > selMax) {
    const swap = selMin;
    selMin = selMax;
    selMax = swap;
  }

  const message = typeof error === "string" && error.trim().length > 0 ? error : null;
  const hasError = !!message;
  const describedBy = hasError ? errorId : undefined;

  const formatValue = (n: number) => {
    if (format) return format(n);
    return prefix ? `${prefix}${n.toLocaleString("en-IN")}` : String(n);
  };

  const updateMin = (raw: number) => {
    onChange({ min: Math.min(clamp(raw), selMax), max: selMax });
  };
  const updateMax = (raw: number) => {
    onChange({ min: selMin, max: Math.max(clamp(raw), selMin) });
  };

  const minPercent = ((selMin - lo) / span) * 100;
  const maxPercent = ((selMax - lo) / span) * 100;

  return (
    <div id={id} className={cn("grid grid-cols-1 gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {label ? (
          <span id={labelId} className="label-brutal text-ink">
            {label}
          </span>
        ) : null}
        <output
          aria-live="polite"
          className="rounded-chip border border-line bg-lemon px-2.5 py-1 text-xs font-bold tabular-nums shadow-hard-xs"
        >
          {formatValue(selMin)} – {formatValue(selMax)}
        </output>
      </div>

      <div className="grid gap-3 border border-line bg-paper p-4 shadow-hard-sm">
        <RangeRow
          rowId={`${baseId}-min-label`}
          rowLabel={minLabel}
          rowValue={selMin}
          percent={minPercent}
          min={lo}
          max={hi}
          step={step}
          disabled={disabled}
          hasError={hasError}
          describedBy={describedBy}
          formatValue={formatValue}
          onRowChange={updateMin}
        />
        <RangeRow
          rowId={`${baseId}-max-label`}
          rowLabel={maxLabel}
          rowValue={selMax}
          percent={maxPercent}
          min={lo}
          max={hi}
          step={step}
          disabled={disabled}
          hasError={hasError}
          describedBy={describedBy}
          formatValue={formatValue}
          onRowChange={updateMax}
        />

        <div className="flex justify-between text-xs font-semibold text-ink-soft">
          <span>{formatValue(lo)}</span>
          <span>{formatValue(hi)}</span>
        </div>
      </div>

      {message ? (
        <p id={errorId} className="break-words text-xs font-semibold text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
