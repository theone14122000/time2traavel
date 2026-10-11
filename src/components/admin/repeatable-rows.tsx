"use client";

import * as React from "react";
import {
  useFieldArray,
  type ArrayPath,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Repeatable row editor (gallery images, social links, …) built on
 * `useFieldArray` — each row gets a remove button, plus an "Add row" control.
 */
export function RepeatableRows<T extends FieldValues>({
  control,
  name,
  renderRow,
  addLabel = "Add row",
  emptyRow,
  max = 20,
}: {
  control: Control<T>;
  name: Path<T>;
  renderRow: (index: number) => React.ReactNode;
  addLabel?: string;
  emptyRow: Record<string, string>;
  max?: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });

  return (
    <div className="grid gap-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative grid gap-3 border-[3px] border-ink bg-paper p-3 pr-12 shadow-hard-xs sm:grid-cols-[1fr_1fr]"
        >
          {renderRow(index)}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-2"
            onClick={() => remove(index)}
            aria-label={`Remove row ${index + 1}`}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ))}

      {fields.length === 0 ? (
        <p className="border-[2px] border-dashed border-ink/50 px-3 py-3 text-xs font-semibold text-ink-soft">
          No rows yet.
        </p>
      ) : null}

      <div>
        <Button
          type="button"
          variant="soft"
          size="sm"
          onClick={() => append(emptyRow as never)}
          disabled={fields.length >= max}
        >
          <Plus aria-hidden="true" className="size-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
