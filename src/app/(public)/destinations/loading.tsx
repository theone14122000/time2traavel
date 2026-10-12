/**
 * Route-level streaming loader for /destinations — same brutalist box + pulse
 * bar as the root loader, with an honest status line for this section.
 */
export default function DestinationsLoading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-paper p-4">
      <div
        role="status"
        className="w-full max-w-md border-[3px] border-ink bg-paper px-6 py-8 text-center shadow-hard-xl"
      >
        <p className="font-display text-3xl uppercase leading-none sm:text-4xl">
          Time2Travel
        </p>

        <div
          aria-hidden="true"
          className="divider-stripe mt-5 h-5 animate-pulse border-[3px] border-ink bg-lemon"
        />

        <p className="label-brutal mt-5 text-ink-soft">Loading destinations…</p>
      </div>
    </div>
  );
}
