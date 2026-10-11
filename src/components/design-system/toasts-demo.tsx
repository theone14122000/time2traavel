"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Triggers for the globally mounted Sonner Toaster. */
export function ToastsDemo() {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            toast.success("Demo success", {
              description: "Component demo — nothing was saved.",
            })
          }
        >
          toast.success
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() =>
            toast.error("Demo error", {
              description: "Component demo — nothing actually failed.",
            })
          }
        >
          toast.error
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast.info("Demo info", {
              description: "Component demo toast.",
            })
          }
        >
          toast.info
        </Button>
      </div>
      <p className="text-sm font-medium text-ink-soft">
        The <code className="font-bold">Toaster</code> is mounted globally in the root
        layout (top-center, brutal styling) — no per-page setup needed.
      </p>
    </div>
  );
}
