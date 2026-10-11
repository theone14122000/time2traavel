"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/utils";

/**
 * Share bar for a package: Web Share API where available, WhatsApp link,
 * and a copy-link fallback (clipboard API).
 */
export function PackageShare({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const url = absoluteUrl(path);
  const text = `${title} — Time to Travel`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    if (!canShare) return;
    try {
      await navigator.share({ title: text, url });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {canShare ? (
          <Button
            type="button"
            variant="dark"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 aria-hidden="true" className="size-4" />
            Share
          </Button>
        ) : null}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-44 inline-flex min-w-[44px] flex-1 items-center justify-center gap-2 border-[3px] border-ink bg-mint px-4 py-2.5 text-xs font-bold uppercase tracking-wide shadow-hard-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          WhatsApp
        </a>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleCopy}
        >
          {copied ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </div>
  );
}
