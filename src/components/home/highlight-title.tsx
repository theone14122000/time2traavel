import { renderHeading } from "@/lib/render-heading";

/**
 * Splits a headline into words and wraps the key word in the GradientWord
 * accent treatment. Purely presentational — the words themselves always come
 * from admin/site settings, never invented.
 */
export function HighlightedTitle({ text }: { text: string }) {
  return <>{renderHeading(text, "ink")}</>;
}
