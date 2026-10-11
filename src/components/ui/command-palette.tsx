"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CornerDownLeft, MapPin, Package, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, durationLabel, formatPrice } from "@/lib/utils";
import { DURATION, EASE } from "@/lib/motion";

/* ------------------------------------------------------------------ *
 * Response shapes (mirrors GET /api/search)                           *
 * ------------------------------------------------------------------ */
type DestinationHit = { slug: string; name: string; state: string };
type PackageHit = {
  slug: string;
  title: string;
  durationDays: number;
  price: number | null;
  currency: string;
};
type SearchResults = { destinations: DestinationHit[]; packages: PackageHit[] };

const EMPTY_RESULTS: SearchResults = { destinations: [], packages: [] };

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

/* ------------------------------------------------------------------ *
 * Provider — global Cmd/Ctrl+K listener + fixed trigger button.       *
 * ------------------------------------------------------------------ */
type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(
  null,
);

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>");
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);
  const pathname = usePathname();
  const isPublicApp = !(pathname ?? "").startsWith("/admin");

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(window.navigator.userAgent));
  }, []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = React.useMemo<CommandPaletteContextValue>(
    () => ({ open, setOpen }),
    [open],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {isPublicApp ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-keyshortcuts="Meta+K Control+K"
            aria-label="Search destinations and packages"
            className="press tap-44 fixed bottom-20 right-4 z-40 hidden items-center gap-2.5 border-[3px] border-ink bg-lemon px-4 shadow-brutal-sm sm:flex lg:bottom-6"
          >
            <Search aria-hidden="true" className="size-4" />
            <span className="label-brutal">Search</span>
            <kbd
              aria-hidden="true"
              className="label-brutal border-[2px] border-ink bg-paper px-1.5 py-1"
            >
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>
          <CommandPaletteDialog open={open} onOpenChange={setOpen} />
        </>
      ) : null}
    </CommandPaletteContext.Provider>
  );
}

/* ------------------------------------------------------------------ *
 * Dialog                                                              *
 * ------------------------------------------------------------------ */
type PaletteRow =
  | { kind: "header"; key: string; label: string }
  | {
      kind: "item";
      key: string;
      index: number;
      title: string;
      meta: string;
      href: string;
      icon: "destination" | "package";
    };

function toRows(results: SearchResults): PaletteRow[] {
  const rows: PaletteRow[] = [];
  let index = 0;

  if (results.destinations.length > 0) {
    rows.push({ kind: "header", key: "header-destinations", label: "Destinations" });
    for (const destination of results.destinations) {
      rows.push({
        kind: "item",
        key: `destination-${destination.slug}`,
        index: index++,
        title: destination.name,
        meta: destination.state,
        href: `/destinations/${destination.slug}`,
        icon: "destination",
      });
    }
  }

  if (results.packages.length > 0) {
    rows.push({ kind: "header", key: "header-packages", label: "Packages" });
    for (const pkg of results.packages) {
      const meta = [durationLabel(pkg.durationDays), formatPrice(pkg.price, pkg.currency)]
        .filter(Boolean)
        .join(" · ");
      rows.push({
        kind: "item",
        key: `package-${pkg.slug}`,
        index: index++,
        title: pkg.title,
        meta,
        href: `/packages/${pkg.slug}`,
        icon: "package",
      });
    }
  }

  return rows;
}

function CommandPaletteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Reset when the palette closes.
  React.useEffect(() => {
    if (open) return;
    setQuery("");
    setDebounced("");
    setResults(EMPTY_RESULTS);
    setActiveIndex(0);
    setLoading(false);
  }, [open]);

  // Debounce the query.
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  // Fetch (abortable) whenever the debounced query changes.
  React.useEffect(() => {
    const term = debounced.trim();
    if (term.length < MIN_QUERY_LENGTH) {
      setResults(EMPTY_RESULTS);
      setActiveIndex(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(term)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Search failed"))))
      .then((data: Partial<SearchResults>) => {
        setResults({
          destinations: Array.isArray(data.destinations) ? data.destinations : [],
          packages: Array.isArray(data.packages) ? data.packages : [],
        });
        setActiveIndex(0);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults(EMPTY_RESULTS);
        setActiveIndex(0);
        setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  const rows = React.useMemo(() => toRows(results), [results]);
  const itemCount = rows.filter((row) => row.kind === "item").length;
  const term = debounced.trim();
  const showEmpty = term.length >= MIN_QUERY_LENGTH && !loading && itemCount === 0;
  const showHint = query.trim().length < MIN_QUERY_LENGTH;

  // Keep the highlighted row in view.
  React.useEffect(() => {
    if (itemCount === 0) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, itemCount]);

  function openHref(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(itemCount - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = rows.find((row) => row.kind === "item" && row.index === activeIndex);
      if (item && item.kind === "item") openHref(item.href);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-lg translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Search Time to Travel</DialogTitle>
        <DialogDescription className="sr-only">
          Search published destinations and packages.
        </DialogDescription>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE }}
          className="grid"
        >
          <div className="flex items-center gap-3 border-b-[3px] border-ink bg-butter px-4 py-3 pr-14">
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search destinations and packages…"
              aria-label="Search destinations and packages"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-ink-soft/80"
            />
            {loading ? (
              <span
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin border-2 border-ink border-t-transparent"
              />
            ) : null}
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label="Search results"
            className="grid max-h-[min(50vh,22rem)] overflow-y-auto bg-paper"
          >
            {showHint ? (
              <li className="px-4 py-6 text-center text-sm font-medium text-ink-soft">
                Type at least {MIN_QUERY_LENGTH} characters to search destinations and
                packages.
              </li>
            ) : null}

            {loading && !showHint ? (
              <>
                <li className="px-4 py-3">
                  <Skeleton className="h-9 w-full border-0" />
                </li>
                <li className="px-4 pb-3">
                  <Skeleton className="h-9 w-full border-0" />
                </li>
                <li className="px-4 pb-4">
                  <Skeleton className="h-9 w-2/3 border-0" />
                </li>
              </>
            ) : null}

            {showEmpty ? (
              <li
                role="status"
                className="grid gap-1 px-4 py-8 text-center"
              >
                <p className="font-display text-h4 uppercase">No matches</p>
                <p className="text-sm font-medium text-ink-soft">
                  Nothing found for “{term}” — try another word.
                </p>
              </li>
            ) : null}

            {rows.map((row) =>
              row.kind === "header" ? (
                <li
                  key={row.key}
                  role="presentation"
                  className="label-brutal sticky top-0 border-b-[2px] border-ink bg-paper px-4 py-2 text-ink-soft"
                >
                  {row.label}
                </li>
              ) : (
                <li key={row.key} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={row.index === activeIndex}
                    data-index={row.index}
                    onMouseEnter={() => setActiveIndex(row.index)}
                    onClick={() => openHref(row.href)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b-[2px] border-ink/15 px-4 py-3 text-left transition-colors",
                      row.index === activeIndex ? "bg-lemon" : "bg-paper hover:bg-butter",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center border-[2px] border-ink",
                        row.icon === "destination" ? "bg-sky" : "bg-peach",
                      )}
                    >
                      {row.icon === "destination" ? (
                        <MapPin className="size-4" />
                      ) : (
                        <Package className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{row.title}</span>
                      {row.meta ? (
                        <span className="block truncate text-xs font-medium text-ink-soft">
                          {row.meta}
                        </span>
                      ) : null}
                    </span>
                    {row.index === activeIndex ? (
                      <CornerDownLeft
                        aria-hidden="true"
                        className="size-4 shrink-0 text-ink-soft"
                      />
                    ) : null}
                  </button>
                </li>
              ),
            )}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t-[3px] border-ink bg-paper px-4 py-2.5">
            <p className="label-brutal text-ink-soft">↑↓ · Enter to open · Esc to close</p>
            <p className="label-brutal text-ink-soft" aria-hidden="true">
              {itemCount} result{itemCount === 1 ? "" : "s"}
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
