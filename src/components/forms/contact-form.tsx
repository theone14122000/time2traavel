"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2, MessageCircle, RotateCcw, Send } from "lucide-react";
import {
  contactSchema,
  type ContactInput,
} from "@/schemas/forms";
import { submitContactAction } from "@/actions/public-forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  HoneypotInput,
} from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const defaultValues: ContactInput = {
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

/** Neutral process copy — no invented facts, no promises about timing. */
const DEFAULT_NEXT_STEPS = [
  "Your message is now with our team.",
  "We'll reply using the email or phone number you shared.",
  "There's nothing else you need to do right now.",
];

/**
 * General inquiry form (contact / CTA bands).
 */
export function ContactForm({
  className,
  defaultMessage,
  submitLabel = "Send Enquiry",
  heading,
  showHeading = true,
  successMessage,
  whatsappUrl,
  successTitle,
  nextSteps,
  subject,
  inquiryType,
}: {
  className?: string;
  defaultMessage?: string;
  submitLabel?: string;
  heading?: string;
  showHeading?: boolean;
  successMessage?: string;
  /** Rendered as a "Continue on WhatsApp" link on the success panel when set. */
  whatsappUrl?: string | null;
  /** Headline for the success panel (defaults to neutral copy). */
  successTitle?: string;
  /** "What happens next" bullets on the success panel. */
  nextSteps?: string[];
  /** Optional enquiry subject recorded with the submission (e.g. a service). */
  subject?: string;
  /** Optional inquiry type recorded with the submission (e.g. "SERVICE"). */
  inquiryType?: "GENERAL" | "SERVICE";
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { ...defaultValues, message: defaultMessage ?? "" },
    mode: "onBlur",
  });

  const { formState } = form;

  async function onSubmit(values: ContactInput) {
    setSubmitError(null);
    const result = await submitContactAction(values, {
      ...(subject ? { subject } : {}),
      ...(inquiryType ? { type: inquiryType } : {}),
    });
    if (result.ok) {
      toast.success(successMessage ?? result.message);
      form.reset({ ...defaultValues, message: defaultMessage ?? "" });
      setSubmitted(true);
      setAnnouncement(successTitle ?? "Thanks — your message has been sent.");
    } else {
      toast.error(result.error);
      setSubmitError(result.error);
      setAnnouncement(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in defaultValues && messages?.[0]) {
            form.setError(field as keyof ContactInput, { message: messages[0] });
          }
        }
      }
    }
  }

  function handleSendAnother() {
    setSubmitted(false);
    setSubmitError(null);
    setAnnouncement("");
    form.reset({ ...defaultValues, message: defaultMessage ?? "" });
  }

  return (
    <div className={cn("relative", className)}>
      {showHeading ? (
        <h3 className="mb-5 font-display text-h3 uppercase">
          {heading ?? "Send us a message"}
        </h3>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {submitted ? (
        <div className="grid gap-4 border-[3px] border-ink bg-mint p-5 shadow-brutal-md sm:p-6">
          <span
            aria-hidden="true"
            className="inline-flex size-12 -rotate-6 items-center justify-center border-[3px] border-ink bg-mint-strong shadow-brutal-sm"
          >
            <Check className="size-6" strokeWidth={4} />
          </span>

          <div className="grid gap-2">
            <h4 className="font-display text-h3 uppercase">
              {successTitle ?? "Thanks — message sent"}
            </h4>
            <p className="label-brutal text-ink-soft">What happens next</p>
            <ul className="grid gap-1.5 text-sm font-medium text-ink">
              {(nextSteps ?? DEFAULT_NEXT_STEPS).map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2 shrink-0 border-[2px] border-ink bg-ink"
                  />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="dark" onClick={handleSendAnother} magnetic>
              <RotateCcw aria-hidden="true" className="size-4" />
              Send another
            </Button>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="press tap-44 inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-5 py-2.5 text-xs font-bold uppercase tracking-wide shadow-brutal-sm"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
                Continue on WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="grid gap-4"
          >
            <HoneypotInput />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Your full name"
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
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Tell us where you'd like to go, when, and who's travelling."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <div className="grid gap-2 border-[2px] border-ink bg-blush px-3 py-2.5">
                <p className="text-sm font-bold">{submitError}</p>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void form.handleSubmit(onSubmit)()}
                  >
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    Try again
                  </Button>
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              loading={formState.isSubmitting}
              magnetic
            >
              {formState.isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4" />
                  Sending
                </>
              ) : (
                <>
                  <Send aria-hidden="true" className="size-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
