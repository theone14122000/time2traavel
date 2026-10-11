"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/components/admin/action-result";

/**
 * Destructive action behind an explicit confirmation dialog
 * (brutalist delete button — danger variant + hard shadow).
 */
export function ConfirmDeleteButton({
  onAction,
  label = "Delete",
  confirmTitle = "Delete this item?",
  confirmDescription = "This can't be undone.",
  successMessage,
  size = "sm",
  className,
}: {
  onAction: () => Promise<ActionResult>;
  label?: string;
  confirmTitle?: string;
  confirmDescription?: string;
  successMessage?: string;
  size?: ButtonProps["size"];
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function confirm() {
    startTransition(async () => {
      try {
        const result = await onAction();
        if (result.ok) {
          toast.success(successMessage ?? result.message);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error("[admin] delete failed:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="danger" size={size} className={className}>
          <Trash2 aria-hidden="true" className="size-3.5" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
          <DialogDescription>{confirmDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm font-medium text-ink-soft">
            Deleting removes the record permanently. Related public pages are
            refreshed automatically.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="danger" type="button" loading={pending} onClick={confirm}>
            <Trash2 aria-hidden="true" className="size-4" />
            Yes, delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
