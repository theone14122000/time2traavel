"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type ItineraryDay = { day: number; title: string; description: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Opens a clean print view of the itinerary + package facts in a new window
 * and calls print() — no dependencies, no server round-trip.
 */
export function PrintItineraryButton({
  title,
  destinationName,
  durationText,
  priceLabel,
  summary,
  itinerary,
}: {
  title: string;
  destinationName?: string | null;
  durationText?: string | null;
  priceLabel?: string | null;
  summary?: string | null;
  itinerary: ItineraryDay[];
}) {
  const [blocked, setBlocked] = React.useState(false);

  function handlePrint() {
    const facts: string[] = [];
    if (destinationName) facts.push(destinationName);
    if (durationText) facts.push(durationText);
    if (priceLabel) facts.push(priceLabel);

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} — itinerary</title>
<style>
  :root { color-scheme: light; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #0a0a0a; background: #fffdf5; margin: 0; padding: 2rem;
    line-height: 1.55;
  }
  h1 { font-size: 1.7rem; text-transform: uppercase; letter-spacing: -0.01em; margin: 0 0 0.35rem; }
  .facts { font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; }
  .summary { margin: 1rem 0 0; max-width: 60ch; }
  ol { list-style: none; padding: 0; margin: 1.5rem 0 0; display: grid; gap: 0.85rem; }
  li { border: 3px solid #0a0a0a; background: #fff; padding: 0.85rem 1rem; break-inside: avoid; }
  .day { display: inline-flex; align-items: center; justify-content: center;
    border: 3px solid #0a0a0a; background: #ffe45e; min-width: 2.5rem; height: 2.5rem;
    font-weight: 800; margin-right: 0.75rem; }
  h2 { display: inline; font-size: 1rem; text-transform: uppercase; }
  p { margin: 0.5rem 0 0 3.25rem; white-space: pre-wrap; }
  footer { margin-top: 2rem; border-top: 2px solid #0a0a0a; padding-top: 0.75rem;
    font-size: 0.75rem; font-weight: 600; }
  @media print {
    body { padding: 0; background: #fff; }
    a { color: inherit; text-decoration: none; }
  }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p class="facts">${escapeHtml(facts.join(" · ")) || "Itinerary"}</p>
    ${summary ? `<p class="summary">${escapeHtml(summary)}</p>` : ""}
  </header>
  ${
    itinerary.length > 0
      ? `<ol>${itinerary
          .map(
            (item) => `<li>
      <span class="day">${item.day}</span><h2>${escapeHtml(item.title)}</h2>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
    </li>`,
          )
          .join("")}</ol>`
      : `<p class="summary">The day-by-day plan will be shared with you on enquiry.</p>`
  }
  <footer>Printed from Time to Travel — time2travel.in</footer>
  <script>window.addEventListener("load", function () { window.focus(); window.print(); });<\/script>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=860,height=900");
    if (!printWindow) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        size="md"
        className="w-full"
        onClick={handlePrint}
      >
        <Printer aria-hidden="true" className="size-4" />
        Print itinerary
      </Button>
      {blocked ? (
        <p role="status" className="text-xs font-semibold text-ink-soft">
          Your browser blocked the print window — allow pop-ups for this site and try again.
        </p>
      ) : null}
    </div>
  );
}
