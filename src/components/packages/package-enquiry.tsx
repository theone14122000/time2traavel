"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";

/**
 * Controlled "Enquire" button + pre-filled package enquiry dialog.
 * The slug/title come from the server page (real DB record).
 */
export function PackageEnquiryButton({
  slug,
  title,
  label = "Enquire about this package",
  variant = "default",
  size = "lg",
  className,
}: {
  slug: string;
  title: string;
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
        target={{ kind: "package", slug, name: title }}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
