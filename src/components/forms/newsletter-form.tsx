"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2, RotateCcw } from "lucide-react";
import { newsletterSchema, type NewsletterInput } from "@/schemas/forms";
import { subscribeNewsletterAction } from "@/actions/public-content";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  HoneypotInput,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const defaults: NewsletterInput = { email: "", website: "" };

export function NewsletterForm({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const form = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: defaults,
    mode: "onBlur",
  });
  const { formState } = form;

  async function onSubmit(values: NewsletterInput) {
    setSubmitError(null);
    const result = await subscribeNewsletterAction(values);
    if (result.ok) {
      toast.success(result.message);
      form.reset(defaults);
      setSubmitted(true);
      setAnnouncement("You're on the list — thanks for subscribing.");
    } else {
      toast.error(result.error);
      setSubmitError(result.error);
      setAnnouncement(result.error);
    }
  }

  function handleSendAnother() {
    setSubmitted(false);
    setSubmitError(null);
    setAnnouncement("");
    form.reset(defaults);
  }

  return (
    <div className="w-full">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {submitted ? (
        <div
          className={cn(
            "flex w-full flex-col gap-3 border-[3px] border-ink p-4 shadow-brutal-sm sm:flex-row sm:items-center sm:justify-between",
            tone === "dark" ? "bg-paper text-ink" : "bg-mint text-ink",
            className,
          )}
        >
          <p className="flex items-center gap-2.5 text-sm font-bold">
            <span
              aria-hidden="true"
              className="inline-flex size-8 shrink-0 -rotate-6 items-center justify-center border-[3px] border-ink bg-mint-strong"
            >
              <Check className="size-4" strokeWidth={4} />
            </span>
            You&apos;re on the list.
          </p>
          <Button type="button" size="sm" variant="soft" onClick={handleSendAnother}>
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Subscribe another email
          </Button>
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className={cn("flex w-full flex-col gap-3 sm:flex-row sm:items-start", className)}
          >
            <HoneypotInput />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      aria-label="Email address for newsletter"
                      placeholder="you@example.com"
                      className={cn(
                        tone === "dark" && "bg-paper text-ink",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="md"
              className="w-full shrink-0 sm:w-auto"
              loading={formState.isSubmitting}
              variant={tone === "dark" ? "default" : "dark"}
              magnetic
            >
              {formState.isSubmitting ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" className="size-4" />
              )}
              Subscribe
            </Button>
          </form>
          {submitError ? (
            <div
              className={cn(
                "mt-2 flex flex-wrap items-center gap-3 border-[2px] border-ink px-3 py-2",
                tone === "dark" ? "bg-paper text-ink" : "bg-blush text-ink",
              )}
            >
              <p className="break-words text-xs font-bold">{submitError}</p>
              <button
                type="button"
                onClick={() => void form.handleSubmit(onSubmit)()}
                className="label-brutal tap-44 inline-flex items-center gap-1.5 border-[2px] border-ink bg-paper px-2.5 py-1.5 shadow-hard-xs transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <RotateCcw aria-hidden="true" className="size-3" />
                Try again
              </button>
            </div>
          ) : null}
        </FormProvider>
      )}
    </div>
  );
}
