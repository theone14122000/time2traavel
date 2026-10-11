"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button, type ButtonProps } from "@/components/ui/button";

export function LogoutButton({
  variant = "outline",
  size = "sm",
  className,
  showLabel = true,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        title="Sign out"
      >
        <LogOut aria-hidden="true" className="size-4" />
        {showLabel ? "Log out" : <span className="sr-only">Log out</span>}
      </Button>
    </form>
  );
}
