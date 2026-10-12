"use client";

import * as React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2, RotateCcw, Star, MessageSquareHeart } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/schemas/forms";
import { submitReviewAction } from "@/actions/public-content";
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

const defaults: ReviewInput = {
  name: "",
  context: "",
  rating: 0,
  comment: "",
  website: "",
};

const NEXT_STEPS = [
  "Your review is queued for our team to check.",
  "It appears publicly only after it's approved.",
];

/**
 * Review submission form — every review is stored as PENDING and only
 * appears publicly after an admin approves it.
 */
export function ReviewForm({
  className,
  contextLabel = "Destination or package (optional)",
  contextPlaceholder = "e.g. a destination or package you travelled with",
}: {
  className?: string;
  contextLabel?: string;
  contextPlaceholder?: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema) as Resolver<ReviewInput>,
    defaultValues: defaults,
    mode: "onBlur",
  });
  const { formState } = form;
  const rating = form.watch("rating");

  async function onSubmit(values: ReviewInput) {
    setSubmitError(null);
    const result = await submitReviewAction(values);
    if (result.ok) {
      toast.success(result.message);
      form.reset(defaults);
      setSubmitted(true);
      setAnnouncement("Thanks — your review has been received.");
    } else {
      toast.error(result.error);
      setSubmitError(result.error);
      setAnnouncement(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in values && messages?.[0]) {
            form.setError(field as keyof ReviewInput, { message: messages[0] });
          }
        }
      }
    }
  }

  function handleSendAnother() {
    setSubmitted(false);
    setSubmitError(null);
    setAnnouncement("");
    form.reset(defaults);
  }

  return (
    <div className={cn("border-[3px] border-ink bg-paper p-4 shadow-hard sm:p-6", className)}>
      <div className="mb-5 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center border-[3px] border-ink bg-lemon"
        >
          <MessageSquareHeart className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-h4 uppercase">Write a review</h3>
          <p className="text-sm font-medium text-ink-soft">
            Reviews are checked by our team before they appear publicly.
          </p>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {submitted ? (
        <div className="grid gap-4 border-[3px] border-ink bg-mint p-5 shadow-brutal-sm">
          <span
            aria-hidden="true"
            className="inline-flex size-12 -rotate-6 items-center justify-center border-[3px] border-ink bg-mint-strong shadow-brutal-sm"
          >
            <Check className="size-6" strokeWidth={4} />
          </span>
          <div className="grid gap-2">
            <h4 className="font-display text-h4 uppercase">Review received</h4>
            <ul className="grid gap-1.5 text-sm font-medium">
              {NEXT_STEPS.map((step) => (
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
          <div>
            <Button type="button" variant="dark" onClick={handleSendAnother} magnetic>
              <RotateCcw aria-hidden="true" className="size-4" />
              Write another
            </Button>
          </div>
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <HoneypotInput />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Your name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{contextLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={contextPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Rating</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Rating out of 5">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const active = (Number(rating) || 0) >= value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={Number(rating) === value}
                            aria-label={`${value} star${value > 1 ? "s" : ""}`}
                            onClick={() => field.onChange(value)}
                            className={cn(
                              "flex size-11 items-center justify-center border-[3px] border-ink transition-all",
                              active ? "bg-lemon shadow-hard-xs" : "bg-paper hover:bg-butter",
                            )}
                          >
                            <Star
                              className={cn("size-5", active && "fill-ink")}
                              aria-hidden="true"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Your review</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Share what stood out about your trip planning experience."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <div className="grid gap-2 border-[2px] border-ink bg-blush px-3 py-2.5">
                <p className="break-words text-sm font-bold">{submitError}</p>
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
              loading={formState.isSubmitting}
              className="w-full sm:w-auto"
              magnetic
            >
              {formState.isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit review"
              )}
            </Button>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
