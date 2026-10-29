"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { GuruIcon } from "@/components/guru/guru-icon";
import { waHref } from "@/lib/contact";
import { HIDE_FLOATING_VAR, Z_FLOATING } from "@/lib/z-index";

// The chat UI loads only when GURU is first opened — the launcher stays tiny.
const GuruPanel = dynamic(() => import("@/components/guru/guru-panel").then((m) => m.GuruPanel), {
  ssr: false,
});

type FloatingContactButtonsProps = {
  /** Raw WhatsApp number from Site Settings; the button is hidden when empty. */
  whatsapp?: string | null;
};

const CONSENT_KEY = "tt:cookie-consent";
const TIP_KEY = "tt:guru-tip-seen";
const COOKIE_GAP = 12;

/** Mobile: clear of the sticky action bar (+ safe area). From `lg:` up the bar is gone. */
const SLOT =
  "pointer-events-none fixed print:hidden bottom-[calc(16px_+_env(safe-area-inset-bottom)_+_64px)] lg:bottom-[calc(16px_+_env(safe-area-inset-bottom))]";

/** `/packages/himachal-special` → the trailing slug, so WhatsApp can mention the page. */
const CONTEXT_PATH = /^\/(?:packages|destinations|services)\/([^/?#]+)/;

function contextName(pathname: string): string | null {
  const slug = CONTEXT_PATH.exec(pathname)?.[1];
  if (!slug) return null;
  try {
    return decodeURIComponent(slug).replace(/-/g, " ").trim() || null;
  } catch {
    return slug.replace(/-/g, " ");
  }
}

function isTypingTarget(el: Element | null): boolean {
  if (!el || el.closest("[data-guru-panel]")) return false;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return true;
  return el instanceof HTMLElement && el.isContentEditable;
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2Zm0 18.15h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.22 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

/**
 * Floating actions: WhatsApp bottom-left, GURU (AI assistant) bottom-right.
 * No phone or email shortcut floats over the page; both stay in the header,
 * footer and contact page.
 */
export function FloatingContactButtons({ whatsapp }: FloatingContactButtonsProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = React.useState(false);
  const [everOpened, setEverOpened] = React.useState(false);
  const [suppressed, setSuppressed] = React.useState(false);
  const [cookieBottom, setCookieBottom] = React.useState<number | null>(null);
  const [tip, setTip] = React.useState(false);
  const launcherRef = React.useRef<HTMLButtonElement>(null);

  const isAdmin = pathname.startsWith("/admin");

  const waLink = React.useMemo(() => {
    const name = contextName(pathname);
    return waHref(
      whatsapp,
      name
        ? `Hi Time2Travel! I'd like help planning a trip to ${name}.`
        : "Hi Time2Travel! I'd like to know more about your travel packages.",
    );
  }, [pathname, whatsapp]);

  // Hide behind other dialogs / while a form field is focused on small screens;
  // lift above the cookie banner while it is visible.
  React.useEffect(() => {
    const measureCookie = () => {
      const banner = document.querySelector<HTMLElement>("[data-cookie-banner]");
      setCookieBottom(
        banner ? Math.round(window.innerHeight - banner.getBoundingClientRect().top + COOKIE_GAP) : null,
      );
    };
    const sync = () => {
      const otherDialog = Boolean(document.querySelector('[role="dialog"]:not([data-guru-panel])'));
      const typingOnSmall =
        window.matchMedia("(max-width: 639px)").matches && isTypingTarget(document.activeElement);
      setSuppressed(otherDialog || typingOnSmall);
      measureCookie();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", () => window.setTimeout(sync, 0));
    window.addEventListener("resize", measureCookie);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", sync);
      window.removeEventListener("resize", measureCookie);
    };
  }, []);

  // One-time, dismissible introduction.
  React.useEffect(() => {
    if (isAdmin) return;
    try {
      if (window.localStorage.getItem(TIP_KEY)) return;
    } catch {
      return;
    }
    const show = window.setTimeout(() => setTip(true), 5000);
    return () => window.clearTimeout(show);
  }, [isAdmin]);

  React.useEffect(() => {
    if (!tip) return;
    const hide = window.setTimeout(() => dismissTip(), 9000);
    return () => window.clearTimeout(hide);
  }, [tip]);

  function dismissTip() {
    setTip(false);
    try {
      window.localStorage.setItem(TIP_KEY, "1");
    } catch {
      // storage unavailable — tooltip may reappear next visit, which is harmless
    }
  }

  const hidden = isAdmin || (suppressed && !open);
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(HIDE_FLOATING_VAR, hidden ? "1" : "0");
    return () => {
      root.style.removeProperty(HIDE_FLOATING_VAR);
    };
  }, [hidden]);

  const trackClick = React.useCallback(
    (name: "whatsapp_click" | "guru_open") => {
      try {
        if (window.localStorage.getItem(CONSENT_KEY) !== "all") return;
        window.dispatchEvent(new CustomEvent(name, { detail: { path: pathname } }));
      } catch {
        // analytics must never surface errors
      }
    },
    [pathname],
  );

  if (isAdmin) return null;

  const bottomStyle: React.CSSProperties = {
    zIndex: Z_FLOATING,
    ...(cookieBottom != null ? { bottom: `${cookieBottom}px` } : null),
    opacity: hidden ? 0 : 1,
    visibility: hidden ? "hidden" : "visible",
    transition: "opacity 180ms ease",
  };

  const openGuru = () => {
    dismissTip();
    setEverOpened(true);
    setOpen((v) => !v);
    if (!open) trackClick("guru_open");
  };

  return (
    <>
      {/* WhatsApp — bottom-left. Covered by the full-screen chat sheet on phones, so hidden then. */}
      {waLink ? (
        <div
          className={`${SLOT} left-4 ${open ? "max-sm:hidden" : ""}`}
          style={bottomStyle}
          aria-hidden={hidden || undefined}
        >
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact Time2Travel on WhatsApp"
            onClick={() => trackClick("whatsapp_click")}
            className="guru-enter pointer-events-auto grid size-14 place-items-center rounded-full border border-white/20 bg-[#128c7e] text-white shadow-hard-lg transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-hard-xl active:scale-95 lg:size-[3.75rem]"
          >
            <WhatsAppGlyph className="size-7" />
          </a>
        </div>
      ) : null}

      {/* GURU — bottom-right */}
      <div
        className={`${SLOT} right-4 flex flex-col items-end gap-3 ${open ? "max-sm:hidden" : ""}`}
        style={bottomStyle}
        aria-hidden={hidden || undefined}
      >
        {tip && !open ? (
          <div
            role="status"
            className="guru-enter pointer-events-auto relative max-w-[15rem] rounded-2xl border border-line bg-paper py-2.5 pl-4 pr-9 text-sm font-medium shadow-hard-lg"
          >
            Meet GURU — your AI travel companion
            <button
              type="button"
              onClick={dismissTip}
              aria-label="Dismiss"
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full text-ink-soft hover:bg-sand hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-7 size-3 rotate-45 border-b border-r border-line bg-paper"
            />
          </div>
        ) : null}

        <button
          ref={launcherRef}
          type="button"
          onClick={openGuru}
          aria-label="Chat with GURU, your AI travel assistant"
          aria-expanded={open}
          aria-haspopup="dialog"
          className="guru-enter guru-launcher pointer-events-auto relative grid size-14 place-items-center rounded-full shadow-hard-lg ring-1 ring-gold/60 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-hard-xl active:scale-95 lg:size-[3.75rem]"
        >
          <GuruIcon className="size-full" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-[#22c55e]"
          />
        </button>
      </div>

      {/* Stays mounted once opened so unsent text and the conversation survive minimising. */}
      {everOpened ? (
        <div hidden={!open}>
          <GuruPanel
            open={open}
            whatsapp={whatsapp}
            path={pathname}
            onClose={() => setOpen(false)}
            restoreFocusTo={launcherRef}
          />
        </div>
      ) : null}
    </>
  );
}
