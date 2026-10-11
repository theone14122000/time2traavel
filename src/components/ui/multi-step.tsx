"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DURATION, EASE, slideIn } from "@/lib/motion";
import { useDraft } from "@/hooks/use-draft";

export type MultiStepDefinition = {
  id: string;
  label: string;
  title: string;
};

export type MultiStepFormProps = {
  steps: MultiStepDefinition[];
  /** Zero-based index of the active step (controlled). */
  current: number;
  /** Called when the user picks another (already visited) step indicator. */
  onStepChange?: (next: number) => void;
  children: React.ReactNode;
  /** e.g. "Step 2 of 4" — announced on the progress bar. */
  progressLabel?: string;
  /**
   * When provided, the active step index is autosaved to
   * `localStorage["tt:draft:<draftKey>"]` as `{ current }` (debounced).
   * Restore is caller-owned: read the same key with `useDraft` and apply it
   * when your form opens, alongside your field-level draft (a *separate*
   * `useDraft` key — this component never stores field values).
   */
  draftKey?: string;
  /** Extra classes for the animated step region (e.g. min-height). */
  contentClassName?: string;
};

const DRAFT_FALLBACK_KEY = "multi-step-unused";

/**
 * Chunky multi-step shell: animated progress bar, clickable step indicators
 * (only completed/visited steps), keyboard-safe arrow handling and reduced
 * motion–aware slide transitions between steps.
 */
export function MultiStepForm({
  steps,
  current,
  onStepChange,
  children,
  progressLabel,
  draftKey,
  contentClassName,
}: MultiStepFormProps) {
  const reduceMotion = useReducedMotion();
  const total = Math.max(steps.length, 1);
  const index = Math.min(Math.max(current, 0), total - 1);
  const active = steps[index];

  // --- direction tracking for the slide transition -------------------------
  const prevIndexRef = React.useRef(index);
  const [direction, setDirection] = React.useState(1);

  React.useEffect(() => {
    if (index !== prevIndexRef.current) {
      setDirection(index > prevIndexRef.current ? 1 : -1);
      prevIndexRef.current = index;
    }
  }, [index]);

  // --- highest visited step (controls which indicators are clickable) ------
  const [visited, setVisited] = React.useState(index);
  React.useEffect(() => {
    setVisited((v) => Math.max(v, index));
  }, [index]);

  // --- optional autosave of { current } ------------------------------------
  const stepDraft = useDraft<{ current: number }>(draftKey ?? DRAFT_FALLBACK_KEY, {
    current: 0,
  });
  const { hydrated: draftHydrated, setValue: setDraftStep } = stepDraft;

  React.useEffect(() => {
    if (!draftKey || !draftHydrated) return;
    setDraftStep({ current: index });
  }, [draftKey, draftHydrated, index, setDraftStep]);

  // --- keyboard: arrows only move focus inside the indicator row -----------
  const listRef = React.useRef<HTMLOListElement>(null);

  function handleIndicatorKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-step-indicator]") ?? [],
    ).filter((button) => !button.disabled);
    if (buttons.length === 0) return;
    const position = buttons.findIndex(
      (button) => button === (event.target as HTMLElement | null),
    );
    if (position === -1) return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? buttons[Math.min(position + 1, buttons.length - 1)]
        : buttons[Math.max(position - 1, 0)];
    next?.focus();
  }

  // --- step slide variants (built on the shared slideIn helpers) ----------
  const variants = {
    enter: (dir: number) => {
      if (reduceMotion) return { opacity: 1 };
      return slideIn(dir >= 0 ? "right" : "left", 40).hidden;
    },
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: DURATION.base, ease: EASE },
    },
    exit: (dir: number) => {
      if (reduceMotion) return { opacity: 1 };
      return {
        ...slideIn(dir >= 0 ? "left" : "right", 40).hidden,
        transition: { duration: DURATION.fast, ease: EASE },
      };
    },
  };

  const progressPct = ((index + 1) / total) * 100;

  return (
    <div className="grid gap-4">
      {/* Chunky progress bar */}
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="label-brutal text-ink-soft">
            {progressLabel ?? `Step ${index + 1} of ${total}`}
          </span>
          {active?.title ? (
            <span className="label-brutal truncate text-ink">{active.title}</span>
          ) : null}
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-label={progressLabel ?? "Form progress"}
          className="h-4 w-full overflow-hidden border-[3px] border-ink bg-paper"
        >
          <motion.div
            className="h-full bg-tomato"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: DURATION.base, ease: EASE }
            }
          />
        </div>
      </div>

      {/* Step indicators — clickable only for visited steps */}
      <ol
        ref={listRef}
        aria-label="Steps"
        onKeyDown={handleIndicatorKeyDown}
        className="flex flex-wrap gap-2"
      >
        {steps.map((step, stepIndex) => {
          const state =
            stepIndex === index ? "current" : stepIndex < index ? "done" : "todo";
          const reachable = stepIndex <= visited && !!onStepChange;
          return (
            <li
              key={step.id}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "label-brutal flex items-center gap-1.5 border-[3px] border-ink px-2.5 py-1.5",
                state === "current" && "bg-lemon shadow-brutal-sm",
                state === "done" && "bg-ink text-cream",
                state === "todo" && "bg-paper text-ink-soft",
              )}
            >
              <button
                type="button"
                data-step-indicator
                disabled={!reachable}
                onClick={() => reachable && onStepChange?.(stepIndex)}
                className={cn(
                  "flex items-center gap-1.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink",
                  reachable
                    ? "cursor-pointer underline-offset-4 hover:underline"
                    : "cursor-default",
                )}
                aria-label={
                  reachable
                    ? `Go to step ${stepIndex + 1}: ${step.label}`
                    : `Step ${stepIndex + 1}: ${step.label}`
                }
              >
                {state === "done" ? (
                  <Check aria-hidden="true" className="size-3.5" strokeWidth={4} />
                ) : (
                  <span aria-hidden="true">{stepIndex + 1}</span>
                )}
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Animated step content */}
      <div className={cn("relative overflow-hidden", contentClassName)}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={active?.id ?? String(index)}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid gap-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
