/**
 * Root-level streaming loader: shown while a route (and its settings/DB reads)
 * is still resolving. Deliberately contains no content previews — only the
 * brand mark, an animated striped bar and an honest status line.
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-paper p-4">
      <div
        role="status"
        className="w-full max-w-md border border-line bg-paper px-6 py-8 text-center shadow-hard-xl"
      >
        <p className="font-display text-3xl uppercase leading-none sm:text-4xl">
          Time2Travel
        </p>

        <div
          aria-hidden="true"
          className="divider-stripe mt-5 h-5 animate-pulse border border-line bg-lemon"
        />

        <p className="label-brutal mt-5 text-ink-soft">Loading…</p>
      </div>
    </div>
  );
}
