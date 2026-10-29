"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Loader2, Search } from "lucide-react";
import { trackInquiryAction, type TrackInquiryResult } from "@/actions/public-forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scrollFieldIntoViewOnFocus } from "@/components/forms/scroll-on-focus";
import { z } from "zod";
import { cn, formatDate } from "@/lib/utils";

const trackInquiryClientSchema = z
  .object({
    refId: z.string().trim().min(4, "Enter the reference id (at least 4 characters)"),
    phone: z.string().trim().max(25, "Phone number is too long").optional().or(z.literal("")),
    email: z.string().trim().max(200, "Email is too long").optional().or(z.literal("")),
  })
  .refine((value) => Boolean(value.phone) || Boolean(value.email), {
    message: "Add the phone number or email you used for the enquiry",
    path: ["_form"],
  });

type TrackFormValues = z.infer<typeof trackInquiryClientSchema>;

const STATUS_LABELS: Record<
  "NEW" | "IN_PROGRESS" | "QUOTED" | "CONTACTED" | "CLOSED",
  string
> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  QUOTED: "Quoted",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

const TYPE_LABELS: Record<
  "GENERAL" | "TRIP_PLAN" | "PACKAGE" | "DESTINATION" | "SERVICE",
  string
> = {
  GENERAL: "General enquiry",
  TRIP_PLAN: "Trip planning",
  PACKAGE: "Package enquiry",
  DESTINATION: "Destination enquiry",
  SERVICE: "Service enquiry",
};

const defaultValues: TrackFormValues = { refId: "", phone: "", email: "" };

/**
 * Enquiry tracking form — matches a reference id against the phone or email
 * used at submission. Shows only status / type / date; never any personal
 * details back to the visitor.
 */
export function TrackInquiryForm({ className }: { className?: string }) {
  const [result, setResult] = React.useState<TrackInquiryResult | null>(null);

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackInquiryClientSchema),
    defaultValues,
    mode: "onBlur",
  });
  const { formState } = form;
  const submitting = formState.isSubmitting;

  async function onSubmit(values: TrackFormValues) {
    const response = await trackInquiryAction({
      refId: values.refId,
      phone: values.phone ?? "",
      email: values.email ?? "",
    });
    setResult(response);
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <FormField
            control={form.control}
            name="refId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference id</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. TTT-2026-0001"
                    autoComplete="off"
                    spellCheck={false}
                    onFocus={scrollFieldIntoViewOnFocus}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone used for the enquiry</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91…"
                    onFocus={scrollFieldIntoViewOnFocus}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email used for the enquiry</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    onFocus={scrollFieldIntoViewOnFocus}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(() => {
            const errors = form.formState.errors as Record<
              string,
              { message?: string } | undefined
            >;
            const rootError = errors._form;
            return rootError?.message ? (
              <p
                role="alert"
                className="break-words border border-line bg-danger px-3 py-2 text-sm font-semibold text-paper"
              >
                {rootError.message}
              </p>
            ) : null;
          })()}

          <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Search aria-hidden="true" className="size-4" />
            )}
            Track my enquiry
          </Button>
        </form>
      </FormProvider>

      <div role="status" aria-live="polite">
        {result && !result.ok ? (
          <div className="border border-line bg-peach p-5 shadow-brutal-md">
            <p className="font-display text-h4 uppercase leading-tight">
              {result.notFound ? "No match" : "Couldn't check right now"}
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed">{result.error}</p>
          </div>
        ) : null}

        {result?.ok ? (
          <div className="border border-line bg-mint p-5 shadow-brutal-md">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center border border-line bg-paper"
              >
                <ClipboardCheck className="size-4" />
              </span>
              <h3 className="font-display text-h4 uppercase">Enquiry found</h3>
            </div>

            <dl className="mt-4 grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <dt className="label-brutal text-ink-soft">Status</dt>
                <dd>
                  <Badge variant="dark" size="lg">
                    {STATUS_LABELS[result.match.status]}
                  </Badge>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <dt className="label-brutal text-ink-soft">Type</dt>
                <dd>
                  <Badge variant="soft" size="lg">
                    {TYPE_LABELS[result.match.type]}
                  </Badge>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <dt className="label-brutal text-ink-soft">Submitted</dt>
                <dd className="text-sm font-semibold">{formatDate(result.match.createdAt)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
