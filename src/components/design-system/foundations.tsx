import { Input } from "@/components/ui/input";
import { GradientWord } from "@/components/ui/gradient-word";

/** Type scale specimens with their fluid clamp() definitions.
 *  Script (display/h1/h2) is never uppercase; handwritten for h3 and below. */
const TYPE_ROWS: { label: string; cls: string; clamp: string; sample: string }[] = [
  {
    label: "display",
    cls: "font-script text-display",
    clamp: "clamp(3rem, 9vw, 7rem)",
    sample: "Travel journal",
  },
  {
    label: "h1",
    cls: "font-script text-h1",
    clamp: "clamp(2.75rem, 11vw, 6rem) · lh 1.16",
    sample: "Your next trip starts here.",
  },
  {
    label: "h2",
    cls: "font-script text-h2",
    clamp: "clamp(2.5rem, 7vw, 4rem) · 40px floor",
    sample: "Section heading",
  },
  {
    label: "h3",
    cls: "font-hand text-h3",
    clamp: "clamp(1.5rem, 4.5vw, 2.25rem)",
    sample: "Sub-section heading",
  },
  {
    label: "h4",
    cls: "font-hand text-h4",
    clamp: "clamp(1.15rem, 2vw + 0.75rem, 1.6rem)",
    sample: "Card heading",
  },
  {
    label: "note",
    cls: "font-hand text-note text-pen-blue",
    clamp: "clamp(1.125rem, 3vw, 1.5rem)",
    sample: "pick a region! (margin note)",
  },
  {
    label: "lead",
    cls: "text-lead font-medium",
    clamp: "clamp(1.0625rem, 1.4vw, 1.3rem)",
    sample: "Introductory paragraph copy for a section lead.",
  },
  {
    label: "body",
    cls: "measure",
    clamp: "17px (1.0625rem) · lh 1.65 · 65ch",
    sample:
      "Body copy sits at the 17px journal size with a comfortable line height and a 65-character measure.",
  },
];

export function TypeScale() {
  return (
    <div className="grid gap-0 border border-line">
      {TYPE_ROWS.map((row, index) => (
        <div
          key={row.label}
          className={
            index === 0
              ? "grid gap-3 p-4 sm:p-5"
              : "grid gap-3 border-t border-line p-4 sm:p-5"
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="label-brutal bg-lemon px-2 py-1.5">text-{row.label}</span>
            <code className="text-xs font-bold text-ink-soft">{row.clamp}</code>
          </div>
          <p className={row.cls}>{row.sample}</p>
        </div>
      ))}
    </div>
  );
}

/** Gradient accent word, chunky labels and stroked outline type. */
export function TypeUtilities() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid gap-3 border border-line bg-paper p-4 shadow-hard-xs sm:p-5">
        <span className="label-brutal text-ink-soft">GradientWord accent</span>
        <p className="font-display text-h3 uppercase leading-tight">
          Highlighted with <GradientWord tone="ink">accent</GradientWord> word.
        </p>
      </div>

      <div className="grid gap-3 border border-line bg-paper p-4 shadow-hard-xs sm:p-5">
        <span className="label-brutal text-ink-soft">.label-brutal / .text-outline</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-brutal border border-line bg-lemon px-2.5 py-1.5">
            Demo label
          </span>
          <span className="label-brutal border border-line bg-ink px-2.5 py-1.5 text-cream">
            Ink label
          </span>
        </div>
        <p className="font-hand text-h3 text-outline">Outline</p>
      </div>
    </div>
  );
}

const SHADOWS = [
  "shadow-hard-xs",
  "shadow-hard-sm",
  "shadow-brutal-sm",
  "shadow-brutal-md",
  "shadow-brutal-lg",
];

const BORDERS = ["border", "border", "border"];

export function ShadowsAndBorders() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHADOWS.map((shadow) => (
          <div
            key={shadow}
            className={`border border-line bg-paper p-5 ${shadow}`}
          >
            <span className="label-brutal text-ink-soft">{shadow}</span>
            <p className="mt-2 text-sm font-semibold">Hard offset shadow sample.</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {BORDERS.map((border) => (
          <div
            key={border}
            className={`flex flex-col gap-2 bg-butter p-5 ${border} border-line`}
          >
            <span className="label-brutal text-ink-soft">{border}</span>
            <p className="text-sm font-semibold">Border weight sample.</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">rounded-none</span>
          <Input
            aria-label="Square corner input demo"
            defaultValue="Square corners"
            className="rounded-none"
          />
        </div>
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">rounded-chip (default)</span>
          <Input
            aria-label="Rounded corner input demo"
            defaultValue="Chip radius"
          />
        </div>
      </div>
    </div>
  );
}
