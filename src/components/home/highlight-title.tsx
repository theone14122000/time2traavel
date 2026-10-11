import * as React from "react";

/**
 * Splits a headline into words and wraps the key word(s) in the highlighter
 * marker treatment (`.marker` / `.marker-hot`). Purely presentational —
 * the words themselves always come from admin/site settings, never invented.
 */
export function HighlightedTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return null;

  const lastIndex = words.length - 1;

  return (
    <>
      {words.map((word, index) => {
        const markerClass =
          index === lastIndex
            ? "marker"
            : index === 0 && words.length >= 4
              ? "marker marker-hot"
              : null;

        return (
          <React.Fragment key={`${word}-${index}`}>
            {index > 0 ? " " : null}
            {markerClass ? (
              <span className={markerClass}>{word}</span>
            ) : (
              word
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
