"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";

/**
 * Controlled "Enquire" button + pre-filled destination enquiry dialog.
 * Receives the slug/name from the server page so the dialog context is
 * always the real database record.
 */
export function DestinationEnquiryButton({
  slug,
  name,
  label = "Enquire about this destination",
  variant = "default",
  size = "lg",
  className,
}: {
  slug: string;
  name: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <EnquiryDialog
        target={{ kind: "destination", slug, name }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
