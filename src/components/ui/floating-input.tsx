"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Floating-label text field with neo-brutalist chrome.
 *
 * The label starts centred inside the field and floats above the value when
 * the field is focused or filled (driven purely by CSS — it stays correct even
 * when react-hook-form writes the value behind React's back).
 *
 * Forwards its ref to the underlying `<input>` and accepts `id` /
 * `aria-invalid` / `aria-describedby` injected by `<FormControl>` (Slot), so it
 * drops straight into the existing form kit.
 *
 * @example
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="email"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel required>Email</FormLabel>
 *       <FormControl>
 *         <FloatingInput
 *           type="email"
 *           label="Email address"
 *           autoComplete="email"
 *           placeholder="you@example.com"
 *           {...field}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 */
export interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Field label. Floats above the value while the field is focused or filled. */
  label: React.ReactNode;
  /** Static adornment pinned to the left edge inside the field (e.g. "+91"). */
  prefix?: React.ReactNode;
  /** Static adornment pinned to the right edge inside the field (e.g. an icon). */
  suffix?: React.ReactNode;
  /** Validation copy. A non-empty string switches the field into its error state. */
  error?: string | null;
  /** Force error visuals when the message is rendered elsewhere (e.g. FormMessage). */
  invalid?: boolean;
  /** Extra classes for the outer wrapper (grid placement, margins). */
  containerClassName?: string;
}

const shellClasses =
  "flex w-full items-stretch rounded-chip border border-line bg-paper shadow-hard-xs transition-shadow duration-150 ease-out " +
  "focus-within:shadow-hard " +
  "data-[invalid=true]:border-danger data-[invalid=true]:shadow-hard " +
  "data-[invalid=true]:focus-within:shadow-hard";

const labelCore =
  "pointer-events-none absolute left-3.5 z-10 select-none font-medium text-ink-soft transition-all duration-150 ease-out " +
  "peer-disabled:opacity-60";

const labelFloated =
  "peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.1em] " +
  "peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs " +
  "peer-not-placeholder-shown:font-bold peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]";

const inputClasses =
  "peer h-12 w-full bg-transparent pl-3.5 text-base font-medium text-ink " +
  "placeholder:font-normal placeholder:text-transparent focus-visible:outline-none disabled:cursor-not-allowed";

function readError(error: string | null | undefined) {
  return typeof error === "string" && error.trim().length > 0 ? error : null;
}

function ErrorHint({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-1.5 break-words text-xs font-semibold text-danger">
      {message}
    </p>
  );
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      prefix,
      suffix,
      error,
      invalid,
      className,
      containerClassName,
      id,
      disabled,
      placeholder,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const message = readError(error);
    const hasError =
      !!message || invalid === true || ariaInvalid === true || ariaInvalid === "true";
    const errorId = `${inputId}-floating-error`;
    const describedBy =
      [ariaDescribedBy, message ? errorId : null].filter(Boolean).join(" ") || undefined;
    const inputAriaInvalid = ariaInvalid ?? (hasError ? true : undefined);

    return (
      <div className={cn("w-full", containerClassName)}>
        <div
          data-invalid={hasError ? "true" : undefined}
          className={cn(shellClasses, disabled && "opacity-50")}
        >
          {prefix ? (
            <span className="label-brutal flex shrink-0 items-center border-r border-line bg-butter px-3 text-ink">
              {prefix}
            </span>
          ) : null}

          <div className="relative min-w-0 flex-1">
            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              placeholder={placeholder || " "}
              aria-invalid={inputAriaInvalid}
              aria-describedby={describedBy}
              className={cn(inputClasses, suffix ? "pr-11" : "pr-3.5", className)}
              {...props}
            />

            <label
              htmlFor={inputId}
              className={cn(
                labelCore,
                "top-1/2 -translate-y-1/2 text-sm",
                labelFloated,
                hasError && "text-danger",
              )}
            >
              {label}
            </label>

            {suffix ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-ink-soft"
              >
                {suffix}
              </span>
            ) : null}
          </div>
        </div>

        {message ? <ErrorHint id={errorId} message={message} /> : null}
      </div>
    );
  },
);
FloatingInput.displayName = "FloatingInput";

/**
 * Floating-label sibling of {@link FloatingInput} for multi-line answers.
 * Same shell, same focus/filled/error behaviour — forwards its ref to the
 * `<textarea>` so it works inside `<FormControl>` too.
 *
 * @example
 * ```tsx
 * <FormControl>
 *   <FloatingTextarea label="Anything else we should know?" rows={4} {...field} />
 * </FormControl>
 * ```
 */
export interface FloatingTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix"> {
  /** Field label. Floats above the value while the field is focused or filled. */
  label: React.ReactNode;
  /** Validation copy. A non-empty string switches the field into its error state. */
  error?: string | null;
  /** Force error visuals when the message is rendered elsewhere (e.g. FormMessage). */
  invalid?: boolean;
  /** Extra classes for the outer wrapper (grid placement, margins). */
  containerClassName?: string;
}

export const FloatingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(
  (
    {
      label,
      error,
      invalid,
      className,
      containerClassName,
      id,
      disabled,
      placeholder,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const fieldId = id ?? reactId;
    const message = readError(error);
    const hasError =
      !!message || invalid === true || ariaInvalid === true || ariaInvalid === "true";
    const errorId = `${fieldId}-floating-error`;
    const describedBy =
      [ariaDescribedBy, message ? errorId : null].filter(Boolean).join(" ") || undefined;
    const fieldAriaInvalid = ariaInvalid ?? (hasError ? true : undefined);

    return (
      <div className={cn("w-full", containerClassName)}>
        <div
          data-invalid={hasError ? "true" : undefined}
          className={cn(shellClasses, disabled && "opacity-50")}
        >
          <div className="relative min-w-0 flex-1">
            <textarea
              ref={ref}
              id={fieldId}
              disabled={disabled}
              placeholder={placeholder || " "}
              aria-invalid={fieldAriaInvalid}
              aria-describedby={describedBy}
              className={cn(
                "peer min-h-32 w-full resize-y bg-transparent px-3.5 pb-2.5 pt-6 text-base font-medium text-ink",
                "placeholder:font-normal placeholder:text-transparent focus-visible:outline-none disabled:cursor-not-allowed",
                className,
              )}
              {...props}
            />

            <label
              htmlFor={fieldId}
              className={cn(
                labelCore,
                "top-2 text-sm",
                labelFloated,
                hasError && "text-danger",
              )}
            >
              {label}
            </label>
          </div>
        </div>

        {message ? <ErrorHint id={errorId} message={message} /> : null}
      </div>
    );
  },
);
FloatingTextarea.displayName = "FloatingTextarea";
