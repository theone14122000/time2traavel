"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FormProviderProps,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const FormFieldContext = React.createContext<string | null>(null);
const FormItemContext = React.createContext<{ id: string } | null>(null);

export function Form<T extends object>({ children, ...props }: FormProviderProps<T>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export function FormField<T extends object>(props: ControllerProps<T>) {
  return (
    <FormFieldContext.Provider value={props.name}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("grid gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
}

export function useFormField() {
  const name = React.useContext(FormFieldContext);
  if (!name) throw new Error("useFormField must be used inside <FormField>");

  const id = React.useContext(FormItemContext)?.id ?? name;
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const fieldState = getFieldState(name, formState);

  return { id, name, ...fieldState };
}

type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function FormLabel({ className, required, children, ...props }: FormLabelProps) {
  const { id } = useFormField();
  return (
    <Label
      htmlFor={id}
      className={cn(required && "after:ml-0.5 after:text-danger after:content-['*']", className)}
      {...props}
    >
      {children}
    </Label>
  );
}

/** Clones the child input to attach id + aria wiring (shadcn pattern). */
export function FormControl({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const { id, error } = useFormField();
  return (
    <Slot
      {...props}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      {children}
    </Slot>
  );
}

export function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { id } = useFormField();
  return (
    <p
      id={`${id}-description`}
      className={cn("text-xs font-medium text-ink-soft", className)}
      {...props}
    />
  );
}

export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { id, error } = useFormField();
  const body = error ? String(error.message) : children;
  if (!body) return null;

  return (
    <p
      id={`${id}-error`}
      role="alert"
      className={cn(
        "inline-block border-[2px] border-ink bg-pink px-2 py-1 text-xs font-bold leading-snug text-ink",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}

/**
 * Hidden honeypot field registered with react-hook-form (field name: website).
 * Kept off-screen — humans never see it, bots fill it and get dropped.
 */
export function HoneypotInput({ name = "website" }: { name?: string }) {
  const { register } = useFormContext();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden"
    >
      <label htmlFor={name}>Leave this field empty</label>
      <input
        id={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register(name)}
      />
    </div>
  );
}
