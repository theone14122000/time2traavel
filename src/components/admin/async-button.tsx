"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionResult } from "@/components/admin/action-result";

/**
 * Button that runs a server action in a transition, surfaces the result as a
 * toast and refreshes the current route so server-rendered data stays fresh.
 */
export function AsyncButton({
  onAction,
  successMessage,
  children,
  ...props
}: Omit<ButtonProps, "onClick" | "type"> & {
  onAction: () => Promise<ActionResult>;
  successMessage?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function run() {
    startTransition(async () => {
      try {
        const result = await onAction();
        if (result.ok) {
          toast.success(successMessage ?? result.message);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error("[admin] action failed:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Button type="button" onClick={run} loading={pending} {...props}>
      {children}
    </Button>
  );
}
