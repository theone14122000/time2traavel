import { Input } from "@/components/ui/input";

/** Type scale specimens with their fluid clamp() definitions. */
const TYPE_ROWS: { label: string; cls: string; clamp: string; sample: string }[] = [
  {
    label: "display",
    cls: "font-display text-display uppercase",
    clamp: "clamp(2.6rem, 8.5vw, 6.5rem)",
    sample: "Travel",
  },
  {
    label: "h1",
    cls: "font-display text-h1 uppercase",
    clamp: "clamp(2.1rem, 6vw, 4.25rem)",
    sample: "Plan your trip",
  },
  {
    label: "h2",
    cls: "font-display text-h2 uppercase",
    clamp: "clamp(1.75rem, 4.4vw, 3.25rem)",
    sample: "Section heading",
  },
  {
    label: "h3",
    cls: "font-display text-h3 uppercase",
    clamp: "clamp(1.35rem, 2.6vw, 2rem)",
    sample: "Sub-section heading",
  },
  {
    label: "h4",
    cls: "font-display text-h4 uppercase",
    clamp: "clamp(1.1rem, 1.6vw, 1.35rem)",
    sample: "Card heading",
  },
  {
    label: "lead",
    cls: "text-lead font-medium",
    clamp: "clamp(1.02rem, 1.5vw, 1.3rem)",
    sample: "Introductory paragraph copy for a section lead.",
  },
  {
    label: "body",
    cls: "text-base font-medium",
    clamp: "1rem (16px base)",
    sample: "Body copy sits at the 16px base with a comfortable line height.",
  },
];

export function TypeScale() {
  return (
    <div className="grid gap-0 border-[3px] border-ink">
      {TYPE_ROWS.map((row, index) => (
        <div
          key={row.label}
          className={
            index === 0
              ? "grid gap-3 p-4 sm:p-5"
              : "grid gap-3 border-t-[3px] border-ink p-4 sm:p-5"
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

/** Highlighter markers, chunky labels and stroked outline type. */
export function TypeUtilities() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid gap-3 border-[3px] border-ink bg-paper p-4 shadow-hard-xs sm:p-5">
        <span className="label-brutal text-ink-soft">.marker / .marker-hot</span>
        <p className="font-display text-h3 uppercase leading-tight">
          Highlighted with <span className="marker">marker</span> and{" "}
          <span className="marker-hot">marker-hot</span> words.
        </p>
      </div>

      <div className="grid gap-3 border-[3px] border-ink bg-paper p-4 shadow-hard-xs sm:p-5">
        <span className="label-brutal text-ink-soft">.label-brutal / .text-outline</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="label-brutal border-[2px] border-ink bg-lemon px-2.5 py-1.5">
            Demo label
          </span>
          <span className="label-brutal border-[2px] border-ink bg-ink px-2.5 py-1.5 text-cream">
            Ink label
          </span>
        </div>
        <p className="font-display text-h2 uppercase text-outline">Outline</p>
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

const BORDERS = ["border-2", "border-[3px]", "border-4"];

export function ShadowsAndBorders() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHADOWS.map((shadow) => (
          <div
            key={shadow}
            className={`border-[3px] border-ink bg-paper p-5 ${shadow}`}
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
            className={`flex flex-col gap-2 bg-butter p-5 ${border} border-ink`}
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
