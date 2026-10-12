"use client";

import * as React from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";

const STORAGE_KEY = "tt:announcement";

function readDismissed(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistDismissed(value: string): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

export function AnnouncementBar({
  text,
  link,
}: {
  text: string;
  link?: string | null;
}) {
  const [visible, setVisible] = React.useState(false);
  const trimmed = text.trim();

  React.useEffect(() => {
    if (!trimmed) {
      setVisible(false);
      return;
    }
    setVisible(readDismissed() !== trimmed);
  }, [trimmed]);

  if (!trimmed || !visible) return null;

  const dismiss = () => {
    persistDismissed(trimmed);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative w-full border-b-[3px] border-ink bg-tomato text-cream"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-40" />

      <div className="relative mx-auto flex w-full max-w-[90rem] items-center justify-center gap-2 px-4 py-2 pr-14 sm:px-6 sm:pr-16 lg:px-10">
        <Megaphone aria-hidden="true" className="hidden size-4 shrink-0 sm:block" />

        {link ? (
          <Link
            href={link}
            className="inline-flex items-center gap-1.5 px-1 text-center text-sm font-bold underline underline-offset-4 hover:bg-lemon"
          >
            {trimmed}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <p className="px-1 text-center text-sm font-bold">{trimmed}</p>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="tap-44 absolute right-2 inline-flex size-9 items-center justify-center border-[3px] border-ink bg-paper shadow-hard-xs transition-colors hover:bg-lemon"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
