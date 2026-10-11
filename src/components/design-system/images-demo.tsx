import { BrutalImage } from "@/components/ui/brutal-image";

const ASPECTS = ["square", "portrait", "landscape", "wide"] as const;

/** Aspect presets with empty `src` (placeholder SVG) plus zoom on/off. */
export function ImagesDemo() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ASPECTS.map((aspect) => (
          <figure key={aspect} className="grid gap-2">
            <BrutalImage src="" alt="" decorative aspect={aspect} />
            <figcaption className="label-brutal text-ink-soft">{aspect}</figcaption>
          </figure>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="grid gap-2">
          <BrutalImage src="" alt="" decorative aspect="wide" zoom />
          <figcaption className="label-brutal text-ink-soft">
            zoom on (hover scales real images)
          </figcaption>
        </figure>
        <figure className="grid gap-2">
          <BrutalImage src="" alt="" decorative aspect="wide" zoom={false} />
          <figcaption className="label-brutal text-ink-soft">zoom off</figcaption>
        </figure>
      </div>

      <p className="text-sm font-medium text-ink-soft">
        Empty <code className="font-bold">src</code> renders the built-in placeholder
        SVG. No <code className="font-bold">/og-image.svg</code> asset exists in{" "}
        <code className="font-bold">public/</code> right now, so that demo slot is
        skipped rather than linking a missing file.
      </p>
    </div>
  );
}
