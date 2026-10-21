import * as React from "react";
import { GradientWord } from "@/components/ui/gradient-word";
import {
  parseHeadingAccent,
  stripAccentSyntax,
  type HeadingGradientTone,
} from "@/lib/heading-accents";

/**
 * renderHeading — parses `[[accent]]` markup (or auto-picks one word)
 * and returns JSX with exactly one <GradientWord>. All other words are
 * plain text so they inherit the heading's solid color.
 *
 * Works inside any heading element or motion.h1/h2/h3.
 */
export function renderHeading(
  text: string,
  tone: HeadingGradientTone = "ink",
): React.ReactNode {
  const { words, accentIndex } = parseHeadingAccent(text);
  if (words.length === 0) return null;

  return (
    <>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          {i > 0 ? " " : null}
          {i === accentIndex ? (
            <GradientWord tone={tone}>{word}</GradientWord>
          ) : (
            word
          )}
        </React.Fragment>
      ))}
    </>
  );
}

/** Plain-text version (brackets stripped) for aria-labels etc. */
export function headingPlainText(text: string): string {
  return stripAccentSyntax(text);
}
