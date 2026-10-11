"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FormLiveRegion, SubmitError } from "@/components/ui/form-status";

type StatusType = "success" | "error" | "info";

const PRESETS: { type: StatusType; message: string }[] = [
  { type: "success", message: "Demo success message — nothing was really sent." },
  { type: "error", message: "Demo error message — nothing really failed." },
  { type: "info", message: "Demo info message — purely a component demo." },
];

/** FormLiveRegion announcements + a SubmitError summary with demo copy. */
export function FormStatusDemo() {
  const [status, setStatus] = React.useState<{ type: StatusType; message: string } | null>(
    null,
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <span className="label-brutal text-ink-soft">FormLiveRegion (aria-live)</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.type}
              type="button"
              size="sm"
              variant={preset.type === "error" ? "danger" : preset.type === "success" ? "secondary" : "outline"}
              onClick={() => setStatus(preset)}
            >
              Show {preset.type}
            </Button>
          ))}
          <Button type="button" size="sm" variant="ghost" onClick={() => setStatus(null)}>
            Clear
          </Button>
        </div>
        <FormLiveRegion message={status?.message ?? null} type={status?.type ?? "info"} />
        {status === null ? (
          <p className="text-xs font-medium text-ink-soft">
            Region stays mounted (empty) so every change is announced.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <span className="label-brutal text-ink-soft">SubmitError — demo messages</span>
        <SubmitError
          title="Demo error summary"
          error="Demo top-level message."
          fieldErrors={{
            demoEmail: "Demo email error.",
            demoDates: "Demo date error.",
          }}
          fieldLabels={{ demoEmail: "Demo email", demoDates: "Demo dates" }}
          fieldIds={{ demoEmail: "inputs-demo-email", demoDates: "inputs-demo-dates" }}
        />
      </div>
    </div>
  );
}
