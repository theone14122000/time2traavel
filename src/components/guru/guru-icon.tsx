import * as React from "react";

/**
 * GURU mark — a compass whose north needle is a four-point spark: guidance
 * (compass) + intelligence (spark). Midnight-to-teal disc, champagne-gold
 * needle, ivory ring. Pure SVG, ~1 KB, legible down to 24px.
 */
export function GuruIcon({
  className,
  title,
}: {
  className?: string;
  /** Provide only when the icon stands alone; otherwise it is decorative. */
  title?: string;
}) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1b3a52" />
          <stop offset="0.55" stopColor="#101d2c" />
          <stop offset="1" stopColor="#0f4a45" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="24" y1="6" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1dcae" />
          <stop offset="1" stopColor="#c7a56a" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill={`url(#${id}-bg)`} />
      <circle cx="24" cy="24" r="21.5" fill="none" stroke="#c7a56a" strokeOpacity="0.55" strokeWidth="1" />
      {/* compass ticks */}
      <g stroke="#faf8f3" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round">
        <path d="M24 5.5v2.2M24 40.3v2.2M5.5 24h2.2M40.3 24h2.2" />
      </g>
      {/* south needle */}
      <path d="M24 24 L20.6 31.5 L24 40 L27.4 31.5 Z" fill="#faf8f3" fillOpacity="0.9" />
      {/* north needle: four-point spark */}
      <path
        d="M24 6 C24.9 13.2 26.6 15.6 33 17 C26.6 18.4 24.9 20.8 24 28 C23.1 20.8 21.4 18.4 15 17 C21.4 15.6 23.1 13.2 24 6 Z"
        fill={`url(#${id}-gold)`}
      />
      <circle cx="24" cy="24" r="2.2" fill="#faf8f3" />
      <circle cx="24" cy="24" r="0.9" fill="#101d2c" />
    </svg>
  );
}
