"use client";

import * as React from "react";
import { X } from "lucide-react";
import { TagChip } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * One selectable filter chip backed by a native button (`TagChip`), so the
 * whole group behaves like a toolbar: `role="group"`, pressed state via
 * `aria-pressed`, 44px targets and a horizontally scrollable rail on mobile
 * that wraps from `md` up.
 *
 * @example
 * ```tsx
 * <ChipMultiSelect
 *   label="Interests"
 *   maxSelectable={3}
 *   options={[
 *     { value: "beaches", label: "Beaches" },
 *     { value: "hills", label: "Hills", count: 12 },
 *   ]}
 *   value={interests}
 *   onChange={setInterests}
 * />
 *
 * // …inside react-hook-form:
 * <ChipMultiSelect
 *   label="Interests"
 *   options={INTEREST_OPTIONS}
 *   value={field.value}
 *   onChange={field.onChange}
 * />
 * ```
 */
export interface ChipOption {
  /** Stable identifier reported back through `onChange`. */
  value: string;
  /** Visible chip copy (rendered uppercase by the chip styles). */
  label: string;
  /** Optional numeric badge shown after the label. */
  count?: number;
  disabled?: boolean;
}

export interface ChipMultiSelectProps {
  /** Currently selected option values (controlled). */
  value: string[];
  onChange: (value: string[]) => void;
  options: ChipOption[];
  /** Group label rendered above the chips. */
  label?: React.ReactNode;
  /** Optional cap on how many chips may be selected at once. */
  maxSelectable?: number;
  /** Render the "Clear all" button. Default true. */
  clearable?: boolean;
  /** Copy for the clear button. Default "Clear all". */
  clearLabel?: string;
  disabled?: boolean;
  /** Validation copy. Marks the group invalid and links the message. */
  error?: string | null;
  /** DOM id for the wrapper (aria wiring is generated from it). */
  id?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

export function ChipMultiSelect({
  value,
  onChange,
  options,
  label,
  maxSelectable,
  clearable = true,
  clearLabel = "Clear all",
  disabled,
  error,
  id,
  className,
}: ChipMultiSelectProps) {
  const reactId = React.useId();
  const baseId = id ?? reactId;
  const labelId = `${baseId}-label`;
  const errorId = `${baseId}-error`;
  const hintId = `${baseId}-hint`;

  const selected = Array.isArray(value) ? value : [];
  const selectedSet = new Set(selected);
  const atMax =
    typeof maxSelectable === "number" && maxSelectable > 0
      ? selected.length >= maxSelectable
      : false;

  const message = typeof error === "string" && error.trim().length > 0 ? error : null;
  const hasError = !!message;
  const describedBy =
    [message ? errorId : null, atMax && maxSelectable ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const toggle = (optionValue: string) => {
    if (disabled) return;
    if (selectedSet.has(optionValue)) {
      onChange(selected.filter((entry) => entry !== optionValue));
      return;
    }
    if (!atMax) onChange([...selected, optionValue]);
  };

  return (
    <div id={id} className={cn("grid grid-cols-1 gap-2.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        {label ? (
          <span id={labelId} className="label-brutal text-ink">
            {label}
          </span>
        ) : null}

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-ink-soft" aria-live="polite">
            {selected.length} selected
          </span>
          {clearable && selected.length > 0 ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange([])}
              className="tap-44 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:text-tomato disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X aria-hidden="true" className="size-3.5" strokeWidth={3} />
              {clearLabel}
            </button>
          ) : null}
        </div>
      </div>

      <div
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        data-invalid={hasError ? "true" : undefined}
        className={cn(
          "flex gap-2 overflow-x-auto no-scrollbar snap-rail pb-1",
          "md:flex-wrap md:overflow-visible md:pb-0",
          hasError && "border-[3px] border-danger p-2",
          disabled && "opacity-50",
        )}
      >
        {options.map((option) => {
          const active = selectedSet.has(option.value);
          const locked =
            !!disabled || !!option.disabled || (!active && atMax);

          return (
            <TagChip
              key={option.value}
              active={active}
              disabled={locked}
              onClick={() => toggle(option.value)}
              className={cn(
                locked &&
                  "opacity-45 disabled:hover:translate-x-0 disabled:hover:translate-y-0",
              )}
            >
              {option.label}
              {typeof option.count === "number" ? (
                <span className="ml-1.5 border-2 border-ink bg-sky px-1.5 py-0.5 text-[0.6rem] tabular-nums">
                  {option.count}
                </span>
              ) : null}
            </TagChip>
          );
        })}
      </div>

      {atMax && maxSelectable ? (
        <p id={hintId} className="text-xs font-semibold text-ink-soft">
          You can select up to {maxSelectable}.
        </p>
      ) : null}

      {message ? (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
