"use client";

import * as React from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDraft } from "@/hooks/use-draft";
import { cn } from "@/lib/utils";

type ChecklistItem = { id: string; label: string };
type ChecklistState = Record<string, boolean>;

const STORAGE_KEY = "travel-essentials";

/**
 * Interactive packing checklist — items tick on/off and persist in
 * localStorage via the shared `useDraft` hook. Fully client-side.
 */
export function Checklists({
  lists,
}: {
  lists: { title: string; description: string | null; items: ChecklistItem[] }[];
}) {
  const { value: draft, setValue, clear, hydrated } = useDraft<ChecklistState>(
    STORAGE_KEY,
    {},
  );

  function toggle(itemId: string) {
    setValue((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  function resetList(items: ChecklistItem[]) {
    setValue((prev) => {
      const next = { ...prev };
      for (const item of items) next[item.id] = false;
      return next;
    });
  }

  if (lists.length === 0) return null;

  const totalChecked = Object.values(draft).filter(Boolean).length;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {lists.map((list, index) => {
          const listKey = `list-${index}`;
          const checkedCount = list.items.filter((item) => draft[item.id]).length;

          return (
            <section
              key={listKey}
              aria-labelledby={`${listKey}-heading`}
              className="flex h-full flex-col border border-line bg-paper shadow-brutal-md"
            >
              <div className="border-b border-line bg-butter px-5 py-4">
                <h3
                  id={`${listKey}-heading`}
                  className="font-display text-h4 uppercase leading-tight"
                >
                  {list.title}
                </h3>
                {list.description ? (
                  <p className="mt-1 text-sm font-medium text-ink-soft">{list.description}</p>
                ) : null}
                <p role="status" aria-live="polite" className="mt-2 label-brutal text-ink-soft">
                  {checkedCount} of {list.items.length} packed
                </p>
              </div>

              <ul className="flex flex-1 flex-col">
                {list.items.map((item) => {
                  const checked = Boolean(draft[item.id]);
                  return (
                    <li key={item.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggle(item.id)}
                        className="tap-44 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-butter/60"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center border border-line transition-colors",
                            checked ? "bg-mint" : "bg-paper",
                          )}
                        >
                          {checked ? <Check className="size-4" strokeWidth={3} /> : null}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold leading-snug",
                            checked && "text-ink-soft line-through",
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-line p-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => resetList(list.items)}
                  disabled={!hydrated}
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Reset this list
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="label-brutal text-ink-soft">
          {hydrated ? `${totalChecked} items checked` : "Loading your checklist…"}
        </p>
        {hydrated ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => clear()}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Clear all checks
          </Button>
        ) : null}
      </div>
    </>
  );
}
