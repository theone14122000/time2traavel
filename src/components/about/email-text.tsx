"use client";

export function EmailText({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  return (
    <span className={className} dir="ltr">
      {address}
    </span>
  );
}
