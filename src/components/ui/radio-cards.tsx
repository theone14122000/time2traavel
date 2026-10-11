"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Radio group rendered as bordered, clickable cards.
 *
 * Uses real `<input type="radio">` elements (labelled by their card) so it
 * keeps native form semantics, works with react-hook-form `Controller` and
 * inherits the site's brutalist focus ring. The selected card flips to
 * `bg-lemon` + `shadow-brutal-sm`.
 *
 * @example
 * ```tsx
 * <RadioCards
 *   name="travelStyle"
 *   label="Travel style"
 *   options={[
 *     { value: "relaxed", label: "Relaxed", description: "Fewer stops, more downtime" },
 *     { value: "packed", label: "Packed", description: "See as much as possible" },
 *   ]}
 *   value={style}
 *   onChange={setStyle}
 * />
 *
 * // …inside react-hook-form:
 * <FormField
 *   control={form.control}
 *   name="travelStyle"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel required>Travel style</FormLabel>
 *       <RadioCards name={field.name} options={STYLE_OPTIONS} value={field.value} onChange={field.onChange} />
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 */
export interface RadioCardOption {
  value: string;
  label: string;
  /** Optional supporting copy shown under the title. */
  description?: string;
  disabled?: boolean;
}

export interface RadioCardsProps {
  /** Shared radio name (native forms + react-hook-form friendly). */
  name: string;
  /** Currently checked value (controlled). */
  value: string;
  onChange: (value: string) => void;
  options: RadioCardOption[];
  /** Group label rendered as a `<legend>`. */
  label?: React.ReactNode;
  /** Keep the legend for screen readers but hide it visually. */
  hideLabel?: boolean;
  /** Card layout from the `sm` breakpoint up. Default 2. */
  columns?: 1 | 2;
  /** Validation copy (string) or a bare flag for visuals only. */
  error?: string | boolean | null;
  disabled?: boolean;
  /** DOM id for the fieldset (aria wiring is generated from it). */
  id?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

export function RadioCards({
  name,
  value,
  onChange,
  options,
  label,
  hideLabel,
  columns = 2,
  error,
  disabled,
  id,
  className,
}: RadioCardsProps) {
  const reactId = React.useId();
  const baseId = id ?? reactId;
  const labelId = `${baseId}-label`;
  const errorId = `${baseId}-error`;

  const errorText =
    typeof error === "string" && error.trim().length > 0 ? error : null;
  const hasError = !!errorText || error === true;
  const labelled = label !== undefined && label !== null;

  return (
    <fieldset
      id={id}
      role={labelled ? "radiogroup" : undefined}
      aria-labelledby={labelled ? labelId : undefined}
      aria-invalid={labelled ? hasError || undefined : undefined}
      aria-describedby={errorText ? errorId : undefined}
      className={cn("grid gap-3 border-0 p-0", className)}
    >
      {label ? (
        <legend id={labelId} className={cn("label-brutal text-ink", hideLabel && "sr-only")}>
          {label}
        </legend>
      ) : null}

      <div className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2")}>
        {options.map((option) => {
          const optionId = `${baseId}-${option.value}`;
          const checked = value === option.value;
          const optionDisabled = !!disabled || !!option.disabled;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex min-h-11 cursor-pointer items-start gap-3 border-[3px] border-ink p-3.5 transition-all",
                checked
                  ? "bg-lemon shadow-brutal-sm"
                  : "bg-paper shadow-hard-xs hover:bg-butter",
                "has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-ink has-[:focus-visible]:outline-offset-3",
                optionDisabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={optionDisabled}
                onChange={() => onChange(option.value)}
                aria-describedby={errorText ? errorId : undefined}
                className={cn(
                  "mt-0.5 size-5 shrink-0 appearance-none rounded-full border-[3px] border-ink bg-paper",
                  "checked:bg-tomato focus-visible:rounded-full",
                  "disabled:cursor-not-allowed",
                )}
              />
              <span className="grid min-w-0 gap-1">
                <span className="text-sm font-bold leading-snug text-ink">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="text-xs font-medium leading-snug text-ink-soft">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      {errorText ? (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {errorText}
        </p>
      ) : null}
    </fieldset>
  );
}
