/**
 * (public) route loader: shown while a page (and its DB reads) streams in.
 * Sits inside the public layout's <main>, so it only needs to fill that box —
 * no content previews, just the brand mark, a striped pulse bar and a status.
 */
export default function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-paper p-4">
      <div
        role="status"
        className="w-full max-w-md border-[3px] border-ink bg-paper px-6 py-8 text-center shadow-hard-xl"
      >
        <p className="label-brutal mx-auto w-fit border-[3px] border-ink bg-ink px-3 py-2 text-cream">
          Time2Travel
        </p>

        <div
          aria-hidden="true"
          className="divider-stripe mt-5 h-5 animate-pulse border-[3px] border-ink bg-lemon"
        />

        <p className="label-brutal mt-5 text-ink-soft">Loading page…</p>
      </div>
    </div>
  );
}
