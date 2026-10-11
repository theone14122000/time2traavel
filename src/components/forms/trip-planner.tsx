"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, MapPinned, RotateCcw } from "lucide-react";
import { tripPlanSchema, type TripPlanInput } from "@/schemas/forms";
import { submitTripPlanAction } from "@/actions/public-forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  HoneypotInput,
} from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MultiStepForm, type MultiStepDefinition } from "@/components/ui/multi-step";
import { useDraft } from "@/hooks/use-draft";
import { BUDGET_RANGES, TRAVELLER_COUNTS, TRIP_TYPES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

export type TripPlannerInitial = {
  destination?: string;
  travelDate?: string;
  travellers?: string;
  tripType?: string;
};

const STEPS: MultiStepDefinition[] = [
  { id: "trip", label: "Trip", title: "Where & how" },
  { id: "dates", label: "Dates", title: "Dates & budget" },
  { id: "contact", label: "Contact", title: "Your details" },
  { id: "send", label: "Send", title: "Review & send" },
];

const STEP_FIELDS: (keyof TripPlanInput)[][] = [
  ["destination", "tripType"],
  ["travelDate", "endDate", "travellers", "budgetRange", "specialRequests"],
  ["name", "email", "phone"],
  [],
];

/** localStorage keys — field values and the active step are stored separately. */
const FIELD_DRAFT_KEY = "trip-planner";
const STEP_DRAFT_KEY = "trip-planner-step";

function buildDefaults(initial?: TripPlannerInitial): TripPlanInput {
  return {
    destination: initial?.destination ?? "",
    travelDate: initial?.travelDate ?? "",
    endDate: "",
    travellers: initial?.travellers ?? "",
    budgetRange: "",
    tripType: initial?.tripType ?? "",
    specialRequests: "",
    name: "",
    email: "",
    phone: "",
    website: "",
  };
}

function hasInitialOverride(initial?: TripPlannerInitial): boolean {
  return Boolean(
    initial?.destination ||
      initial?.travelDate ||
      initial?.travellers ||
      initial?.tripType,
  );
}

function hasDraftData(values: TripPlanInput): boolean {
  return Boolean(
    values.destination ||
      values.travelDate ||
      values.endDate ||
      values.travellers ||
      values.budgetRange ||
      values.tripType ||
      values.specialRequests ||
      values.name ||
      values.email ||
      values.phone,
  );
}

/**
 * Animated multi-step trip planning form.
 *
 * Drafts: field values persist under `tt:draft:trip-planner` and the active
 * step under `tt:draft:trip-planner-step` (both debounced). They are restored
 * when the dialog opens unless an `initial` override was provided; both are
 * cleared after a successful submit.
 */
export function TripPlanner({
  open,
  onOpenChange,
  initial,
  standalone = false,
  tripTypes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TripPlannerInitial;
  /**
   * Renders the planner inline (no dialog) — used by /plan-my-trip.
   * In standalone mode the form is always "open": drafts restore on mount
   * and field values autosave as usual.
   */
  standalone?: boolean;
  /** Overrides the trip-type choices (defaults to the built-in taxonomy). */
  tripTypes?: string[];
}) {
  const [step, setStep] = React.useState(0);
  const [formError, setFormError] = React.useState<string | null>(null);
  const skipWatchRef = React.useRef(false);
  const active = standalone || open;
  const tripTypeOptions = tripTypes?.length ? tripTypes : TRIP_TYPES;
  const prefillKey = JSON.stringify(initial ?? null);

  const fieldDraft = useDraft<TripPlanInput>(FIELD_DRAFT_KEY, buildDefaults(initial));
  const stepDraft = useDraft<{ current: number }>(STEP_DRAFT_KEY, { current: 0 });
  const { setValue: setFieldDraftValue } = fieldDraft;

  const form = useForm<TripPlanInput>({
    resolver: zodResolver(tripPlanSchema),
    defaultValues: buildDefaults(initial),
    mode: "onBlur",
  });

  // Autosave field values while the form is open (debounced inside useDraft).
  React.useEffect(() => {
    if (!active) return;
    const subscription = form.watch((values) => {
      if (skipWatchRef.current) return;
      setFieldDraftValue(values as TripPlanInput);
    });
    return () => subscription.unsubscribe();
  }, [active, form, setFieldDraftValue]);

  // Restore draft (or defaults / initial override) each time the dialog opens.
  React.useEffect(() => {
    if (!active || !fieldDraft.hydrated) return;
    setFormError(null);

    if (hasInitialOverride(initial)) {
      skipWatchRef.current = true;
      form.reset(buildDefaults(initial));
      skipWatchRef.current = false;
      stepDraft.clear();
      setStep(0);
      return;
    }

    if (hasDraftData(fieldDraft.value)) {
      skipWatchRef.current = true;
      form.reset(fieldDraft.value);
      skipWatchRef.current = false;
      const saved = stepDraft.value.current;
      const clamped =
        typeof saved === "number" && Number.isFinite(saved)
          ? Math.min(Math.max(Math.trunc(saved), 0), STEPS.length - 1)
          : 0;
      setStep(clamped);
      return;
    }

    skipWatchRef.current = true;
    form.reset(buildDefaults(initial));
    skipWatchRef.current = false;
    stepDraft.clear();
    setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fieldDraft.hydrated, prefillKey]);

  function goToStep(next: number) {
    const clamped = Math.min(Math.max(next, 0), STEPS.length - 1);
    setStep(clamped);
  }

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    if (fields.length === 0) return;
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) {
      toast.error("Please fix the highlighted fields to continue.");
      setFormError("Some fields need fixing before you can continue.");
      return;
    }
    setFormError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setFormError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: TripPlanInput) {
    setFormError(null);
    const result = await submitTripPlanAction(values);
    if (result.ok) {
      toast.success(result.message);
      fieldDraft.clear();
      stepDraft.clear();
      skipWatchRef.current = true;
      form.reset(buildDefaults(initial));
      skipWatchRef.current = false;
      setStep(0);
      onOpenChange(false);
    } else {
      toast.error(result.error);
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in values && messages?.[0]) {
            form.setError(field as keyof TripPlanInput, { message: messages[0] });
          }
        }
        const first = Object.keys(result.fieldErrors)[0];
        if (first === "name" || first === "email" || first === "phone") {
          setStep(2);
        } else if (first === "travelDate" || first === "endDate") {
          setStep(1);
        }
      }
    }
  }

  const values = form.watch();
  const { formState } = form;

  const body = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-4 sm:p-5">
        <HoneypotInput />

        <MultiStepForm
          steps={STEPS}
          current={step}
          onStepChange={goToStep}
          draftKey={STEP_DRAFT_KEY}
          progressLabel="Trip planner"
          contentClassName="min-h-[330px] sm:min-h-[320px]"
        >
          {step === 0 ? (
            <>
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Where do you want to go?</FormLabel>
                    <FormControl>
                      <Input placeholder="Destination or region" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tripType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip type</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not sure yet</SelectItem>
                          {tripTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="travellers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travellers</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How many people?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not sure yet</SelectItem>
                          {TRAVELLER_COUNTS.map((count) => (
                            <SelectItem key={count} value={count}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="travelDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Start date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget range</FormLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">To be discussed</SelectItem>
                        {BUDGET_RANGES.map((budget) => (
                          <SelectItem key={budget} value={budget}>
                            {budget}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special requests</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Accessibility needs, celebration, dietary notes…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
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
                      <Input type="tel" autoComplete="tel" placeholder="+91 ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-3">
              <h4 className="font-display text-h4 uppercase">Review your trip</h4>
              <dl className="grid gap-2 border-[3px] border-ink bg-butter p-4 text-sm sm:grid-cols-2">
                <Summary label="Destination" value={values.destination} />
                <Summary label="Trip type" value={values.tripType} />
                <Summary
                  label="Start date"
                  value={values.travelDate ? formatDate(values.travelDate) : ""}
                />
                <Summary
                  label="End date"
                  value={values.endDate ? formatDate(values.endDate) : ""}
                />
                <Summary label="Travellers" value={values.travellers} />
                <Summary label="Budget" value={values.budgetRange} />
                <Summary label="Name" value={values.name} />
                <Summary label="Email" value={values.email} />
                <Summary label="Phone" value={values.phone} />
                <Summary label="Notes" value={values.specialRequests} wide />
              </dl>
              <p className="text-xs font-medium text-ink-soft">
                By sending this you agree that we may contact you about this trip request.
              </p>
            </div>
          ) : null}
        </MultiStepForm>

        {formError ? (
          <div className="flex items-center gap-2 border-[2px] border-ink bg-blush px-3 py-2 text-sm font-bold">
            <RotateCcw aria-hidden="true" className="size-4 shrink-0" />
            {formError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-ink pt-4">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" size="lg" onClick={handleNext}>
              Continue
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="lg" loading={formState.isSubmitting} magnetic>
              {formState.isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <MapPinned aria-hidden="true" className="size-4" />
                  Send trip request
                </>
              )}
            </Button>
          )}
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {formError ?? ""}
        </p>
      </form>
    </FormProvider>
  );

  if (standalone) {
    return (
      <div className="border-4 border-ink bg-cream shadow-brutal-lg">
        <div className="border-b-[3px] border-ink bg-butter p-4 pr-14 sm:p-5 sm:pr-14">
          <h2 className="font-display text-xl leading-tight sm:text-2xl">Plan my trip</h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">
            Four quick steps — we&apos;ll come back with a plan built around your dates and
            budget.
          </p>
        </div>
        {body}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan my trip</DialogTitle>
          <DialogDescription>
            Four quick steps — we&apos;ll come back with a plan built around your dates and budget.
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

function Summary({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string | null;
  wide?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={cn("flex flex-col gap-0.5", wide && "sm:col-span-2")}>
      <dt className="label-brutal text-ink-soft">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
