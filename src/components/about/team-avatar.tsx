"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const PLACEHOLDER_SRC = "/team/placeholder.svg";

export type TeamAvatarProps = {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
};

export function TeamAvatar({
  src,
  alt,
  className,
  sizes = "220px",
}: TeamAvatarProps) {
  const [failed, setFailed] = React.useState(false);
  const current = failed ? PLACEHOLDER_SRC : src?.trim() || PLACEHOLDER_SRC;

  return (
    <Image
      src={current}
      alt={alt}
      width={400}
      height={400}
      sizes={sizes}
      className={cn(
        "aspect-square rounded-full border border-line object-cover shadow-hard",
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}
