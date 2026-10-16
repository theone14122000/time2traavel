"use client";

import * as React from "react";

type Token = { name: string; className: string; textOn: "ink" | "paper" };

const TOKENS: Token[] = [
  { name: "paper", className: "bg-paper", textOn: "ink" },
  { name: "ink", className: "bg-ink", textOn: "paper" },
  { name: "sunrise", className: "bg-sunrise", textOn: "ink" },
  { name: "mint", className: "bg-mint", textOn: "ink" },
  { name: "sky", className: "bg-sky", textOn: "ink" },
  { name: "peach", className: "bg-peach", textOn: "ink" },
  { name: "lavender", className: "bg-lavender", textOn: "ink" },
  { name: "blush", className: "bg-blush", textOn: "ink" },
  { name: "sand", className: "bg-sand", textOn: "ink" },
  { name: "tomato", className: "bg-tomato", textOn: "ink" },
  { name: "lemon", className: "bg-lemon", textOn: "ink" },
  { name: "coral", className: "bg-coral", textOn: "ink" },
  { name: "mint-strong", className: "bg-mint-strong", textOn: "ink" },
  { name: "sky-strong", className: "bg-sky-strong", textOn: "ink" },
  { name: "success", className: "bg-success", textOn: "paper" },
  { name: "warning", className: "bg-warning", textOn: "ink" },
  { name: "danger", className: "bg-danger", textOn: "paper" },
];

/**
 * Colour swatch grid plus a strip that rotates through the palette
 * (auto-pauses for reduced-motion users).
 */
export function ColorTokens() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % TOKENS.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  const current = TOKENS[active];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {TOKENS.map((token) => (
          <div
            key={token.name}
            className={`flex aspect-square flex-col justify-between border-[3px] border-ink p-2.5 ${token.className} ${
              token.textOn === "paper" ? "text-paper" : "text-ink"
            }`}
          >
            <span className="label-brutal">{token.name}</span>
            <code className="text-xs font-bold">{token.className}</code>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <span className="label-brutal text-ink-soft">
          Rotating demo strip (pauses for reduced motion)
        </span>
        <div
          className={`flex min-h-24 items-center justify-between gap-3 border-[3px] border-ink p-4 shadow-brutal-sm ${current.className} ${
            current.textOn === "paper" ? "text-paper" : "text-ink"
          }`}
        >
          <span className="font-display text-h3 uppercase">{current.name}</span>
          <code className="text-sm font-bold">{current.className}</code>
        </div>
        <div className="flex flex-wrap gap-1.5" aria-hidden="true">
          {TOKENS.map((token, index) => (
            <span
              key={token.name}
              className={`size-3.5 border-2 border-ink ${
                index === active ? "bg-ink" : "bg-paper"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
