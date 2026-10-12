"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompare } from "@/components/packages/compare-context";
import { slideIn } from "@/lib/motion";
import { cn, durationLabel, formatPrice } from "@/lib/utils";
import type { PackageCard } from "@/lib/data/packages";

type Row = {
  label: string;
  render: (pkg: PackageCard) => React.ReactNode;
};

const ROWS: Row[] = [
  {
    label: "Destination",
    render: (pkg) =>
      pkg.destination ? (
        <Link
          href={`/destinations/${pkg.destination.slug}`}
          className="underline decoration-[2px] underline-offset-4 hover:bg-lemon"
        >
          {pkg.destination.name}
        </Link>
      ) : (
        "—"
      ),
  },
  {
    label: "Duration",
    render: (pkg) => durationLabel(pkg.durationDays, pkg.durationLabel) || "—",
  },
  {
    label: "Price",
    render: (pkg) => (pkg.price != null ? formatPrice(pkg.price, pkg.currency) : "—"),
  },
  {
    label: "Featured",
    render: (pkg) => (pkg.featured ? "Yes" : "—"),
  },
  {
    label: "Details",
    render: (pkg) => (
      <Link
        href={`/packages/${pkg.slug}`}
        className="inline-flex items-center gap-1 font-bold uppercase tracking-wide underline decoration-[2px] underline-offset-4 hover:bg-lemon"
      >
        View
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    ),
  },
];

/**
 * Fixed comparison tray. Sits above the mobile action bar (`bottom-20`) and
 * opens a side-by-side table for up to `COMPARE_LIMIT` packages.
 */
export function CompareTray() {
  const { enabled, selected, remove, clear } = useCompare();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);

  if (!enabled || selected.length === 0) return null;

  return (
    <>
      <motion.aside
        role="region"
        aria-label="Package comparison tray"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={slideIn("bottom", 72)}
        className="fixed inset-x-0 bottom-20 z-[50] px-2 sm:px-4"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 border-4 border-ink bg-ink p-3 text-cream shadow-hard-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-1">
            {selected.map((pkg) => (
              <span
                key={pkg.id}
                className="inline-flex shrink-0 items-center gap-2 border-[3px] border-cream bg-paper px-2 py-1.5 text-ink"
              >
                <span className="max-w-[10rem] truncate text-xs font-bold uppercase tracking-wide sm:max-w-[14rem]">
                  {pkg.title}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${pkg.title} from compare`}
                  onClick={() => remove(pkg.id)}
                  className="tap-44 -my-1 flex items-center justify-center border-[2px] border-ink bg-lemon transition-colors hover:bg-tomato"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clear}
              className="tap-44 border-cream bg-ink text-cream hover:bg-ink-soft"
            >
              Clear all
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="tap-44"
              onClick={() => setOpen(true)}
            >
              Compare ({selected.length})
            </Button>
          </div>
        </div>
      </motion.aside>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compare packages</DialogTitle>
            <DialogDescription>
              Side-by-side view of the packages you selected. Prices only appear when
              they are published in our catalogue.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <caption className="sr-only">
                  Comparison of {selected.length} travel packages
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="label-brutal border-[3px] border-ink bg-lemon px-3 py-3"
                    >
                      Feature
                    </th>
                    {selected.map((pkg) => (
                      <th
                        key={pkg.id}
                        scope="col"
                        className="border-[3px] border-ink bg-butter px-3 py-3 align-top font-display text-sm uppercase leading-tight"
                      >
                        {pkg.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.label}>
                      <th
                        scope="row"
                        className="label-brutal border-[3px] border-ink bg-paper px-3 py-3 align-top text-ink-soft"
                      >
                        {row.label}
                      </th>
                      {selected.map((pkg) => (
                        <td
                          key={pkg.id}
                          className={cn(
                            "border-[3px] border-ink px-3 py-3 align-top text-sm font-medium",
                            row.label === "Featured" ? "bg-paper" : "bg-cream",
                          )}
                        >
                          {row.render(pkg)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="dark" size="md" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
