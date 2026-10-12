"use client";

import * as React from "react";
import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { mailtoHref, waHref } from "@/lib/contact";
import { HIDE_FLOATING_VAR, Z_FLOATING } from "@/lib/z-index";

type FloatingContactButtonsProps = {
  /** Raw WhatsApp number from Site Settings; button hidden when empty. */
  whatsapp?: string | null;
  /** Contact email from Site Settings; button hidden when empty. */
  email?: string | null;
};

type TrackableEvent = "whatsapp_click" | "email_click";

/** framer's `transition` prop type (not re-exported by framer-motion 14). */
type AppTransition = NonNullable<MotionProps["transition"]>;

/** Consent mirror shared with the cookie banner. */
const CONSENT_KEY = "tt:cookie-consent";

/** Brand colours (kept literal so framer-motion can interpolate them). */
const INK = "#0a0a0a";
const WHATSAPP_GREEN = "#25d366";
const HARD_SHADOW = `4px 4px 0 ${INK}`;
const COLLAPSED_SHADOW = `0px 0px 0px ${INK}`;

/** Extra lift while the cookie banner is on screen (measured at runtime). */
const COOKIE_GAP = 12;
/** Seconds of calm before the WhatsApp buttons make their first appearance. */
const ENTRY_DELAY = 1;
const ENTRY_DELAY_EMAIL = 1.15;

/** `/packages/himachal-special` → the trailing slug segment. */
const CONTEXT_PATH = /^\/(?:packages|destinations|services)\/([^/?#]+)/;

/** Mobile bottom offset: clear of the sticky action bar (+ safe area). */
const BOTTOM_SM =
  "bottom-[calc(16px_+_env(safe-area-inset-bottom)_+_56px)]";
/** The action bar is hidden from `lg:` up, so drop the extra offset there. */
const BOTTOM_UP = "lg:bottom-[calc(16px_+_env(safe-area-inset-bottom))]";

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return true;
  }
  return el instanceof HTMLElement && el.isContentEditable;
}

function prettifySlug(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // Malformed percent-encoding — fall back to the raw slug.
  }
  return decoded.replace(/-/g, " ").trim();
}

/** Human name for the detail page the visitor is looking at, if any. */
function contextName(pathname: string): string | null {
  const match = CONTEXT_PATH.exec(pathname);
  if (!match?.[1]) return null;
  return prettifySlug(match[1]) || null;
}

/**
 * Floating contact shortcuts: WhatsApp + email stacked bottom-right.
 *
 * - Links are built from Site Settings via `@/lib/contact` helpers.
 * - The message/subject is contextualised from the current route.
 * - Hover (or keyboard focus) expands each button into a labelled pill on `sm+`.
 * - Hides itself on `/admin`, while a `[role="dialog"]` is mounted, while a
 *   field is focused (mobile keyboard), and in print; lifts above the cookie
 *   banner while that banner is visible.
 * - Clicks are reported only when the visitor opted into analytics.
 */
export function FloatingContactButtons({
  whatsapp,
  email,
}: FloatingContactButtonsProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [suppressed, setSuppressed] = React.useState(false);
  const [cookieBottom, setCookieBottom] = React.useState<number | null>(null);
  const [pulseLive, setPulseLive] = React.useState(true);
  const cookieTimer = React.useRef<number | null>(null);

  // --- links + contextual copy ------------------------------------------
  const links = React.useMemo(() => {
    const name = contextName(pathname);
    const message = name
      ? `Hi Time2Travel! I'd like help planning a trip to ${name}.`
      : "Hi Time2Travel! I'd like to know more about your travel packages.";
    const subject = name
      ? `Travel Inquiry - Time2Travel (${name})`
      : "Travel Inquiry - Time2Travel";
    return {
      wa: whatsapp ? waHref(whatsapp, message) : null,
      mail: email ? mailtoHref(email, subject) : null,
    };
  }, [pathname, whatsapp, email]);

  const isAdmin = pathname.startsWith("/admin");
  const hidden = isAdmin || suppressed;

  // --- hide on dialogs / focused fields, lift above the cookie banner -----
  React.useEffect(() => {
    const measureCookie = () => {
      const banner = document.querySelector<HTMLElement>("[data-cookie-banner]");
      if (!banner) {
        setCookieBottom(null);
        return;
      }
      setCookieBottom(
        Math.round(
          window.innerHeight - banner.getBoundingClientRect().top + COOKIE_GAP,
        ),
      );
    };

    const sync = () => {
      const dialogOpen = Boolean(document.querySelector('[role="dialog"]'));
      setSuppressed(dialogOpen || isTypingTarget(document.activeElement));
      measureCookie();
    };

    // The banner pops in over ~250ms — measure again once it has settled.
    const scheduleRemeasure = () => {
      if (cookieTimer.current !== null) window.clearTimeout(cookieTimer.current);
      cookieTimer.current = window.setTimeout(() => {
        cookieTimer.current = null;
        measureCookie();
      }, 400);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (isTypingTarget(event.target as Element | null)) setSuppressed(true);
    };
    const onFocusOut = () => {
      window.setTimeout(sync, 0);
    };
    const onResize = () => {
      measureCookie();
    };

    sync();
    const observer = new MutationObserver(() => {
      sync();
      scheduleRemeasure();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("resize", onResize);
      if (cookieTimer.current !== null) {
        window.clearTimeout(cookieTimer.current);
      }
    };
  }, []);

  // --- publish visibility for pure-CSS consumers -------------------------
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(HIDE_FLOATING_VAR, hidden ? "1" : "0");
    return () => {
      root.style.removeProperty(HIDE_FLOATING_VAR);
    };
  }, [hidden]);

  // --- analytics (consent-gated, silent) ---------------------------------
  const trackClick = React.useCallback(
    (name: TrackableEvent) => {
      try {
        if (window.localStorage.getItem(CONSENT_KEY) !== "all") return;
        window.dispatchEvent(
          new CustomEvent(name, { detail: { path: pathname } }),
        );
        const dataLayer = (window as { dataLayer?: unknown[] }).dataLayer;
        if (Array.isArray(dataLayer)) {
          dataLayer.push({ event: name, path: pathname });
        }
      } catch {
        // Storage or analytics unavailable — never surface it to the visitor.
      }
    },
    [pathname],
  );

  const stopPulse = React.useCallback(() => setPulseLive(false), []);

  const entryInitial = reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 };
  const entryAnimate = reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 };
  const springEntry = (delay: number): AppTransition =>
    reduceMotion
      ? { duration: 0.35, delay, ease: "easeOut" }
      : { type: "spring", stiffness: 320, damping: 24, delay };

  if (isAdmin) return null;

  const hideTransition: AppTransition = {
    duration: reduceMotion ? 0 : 0.18,
    ease: "easeOut",
  };

  return (
    <>
      {links.wa || links.mail ? (
        <div
          className={`group/fab pointer-events-none fixed right-4 z-[45] flex flex-col items-end gap-3 print:hidden ${BOTTOM_SM} ${BOTTOM_UP}`}
          style={{
            zIndex: Z_FLOATING,
            bottom: cookieBottom != null ? `${cookieBottom}px` : undefined,
            pointerEvents: "none",
          }}
          aria-hidden={hidden ? "true" : undefined}
        >
          {links.wa ? (
            <motion.a
              href={links.wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              data-fab="whatsapp"
              className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center transition-[width] duration-300 ease-out sm:h-15 sm:w-15 sm:hover:w-[232px] sm:focus-visible:w-[232px]"
              style={{ pointerEvents: hidden ? "none" : "auto" }}
              initial={entryInitial}
              animate={entryAnimate}
              transition={springEntry(ENTRY_DELAY)}
              onClick={() => trackClick("whatsapp_click")}
              onPointerEnter={stopPulse}
              onPointerDown={stopPulse}
              onFocus={stopPulse}
            >
              {!reduceMotion && pulseLive ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full border-[3px]"
                  style={{ borderColor: WHATSAPP_GREEN }}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0, 0.7, 0], scale: [1, 1.5, 1.5] }}
                  transition={{
                    duration: 1.4,
                    times: [0, 0.35, 1],
                    repeat: Infinity,
                    repeatDelay: 8,
                    delay: 2.6,
                    ease: "easeOut",
                  }}
                />
              ) : null}

              <motion.span
                tabIndex={-1}
                className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border-[3px] border-ink bg-[#25D366] text-white shadow-[4px_4px_0_var(--color-ink)]"
                animate={{
                  opacity: hidden ? 0 : 1,
                  y: hidden ? 12 : 0,
                  boxShadow: HARD_SHADOW,
                }}
                transition={hideTransition}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.06,
                        y: -2,
                        transition: { type: "spring", stiffness: 420, damping: 26 },
                      }
                }
                whileTap={{
                  scale: 0.94,
                  boxShadow: COLLAPSED_SHADOW,
                  transition: { duration: 0.08 },
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  className="size-6 shrink-0"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="label-brutal hidden max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-[168px] group-focus-visible:ml-2 group-focus-visible:max-w-[168px] sm:block">
                  Chat on WhatsApp
                </span>
              </motion.span>
            </motion.a>
          ) : null}

          {links.mail ? (
            <motion.a
              href={links.mail}
              aria-label="Email us"
              data-fab="email"
              className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center transition-[width] duration-300 ease-out sm:h-15 sm:w-15 sm:hover:w-[160px] sm:focus-visible:w-[160px]"
              style={{ pointerEvents: hidden ? "none" : "auto" }}
              initial={entryInitial}
              animate={entryAnimate}
              transition={springEntry(ENTRY_DELAY_EMAIL)}
              onClick={() => trackClick("email_click")}
            >
              <motion.span
                tabIndex={-1}
                className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border-[3px] border-ink bg-sky text-ink shadow-[4px_4px_0_var(--color-ink)]"
                animate={{
                  opacity: hidden ? 0 : 1,
                  y: hidden ? 12 : 0,
                  boxShadow: HARD_SHADOW,
                }}
                transition={hideTransition}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.06,
                        y: -2,
                        transition: { type: "spring", stiffness: 420, damping: 26 },
                      }
                }
                whileTap={{
                  scale: 0.94,
                  boxShadow: COLLAPSED_SHADOW,
                  transition: { duration: 0.08 },
                }}
              >
                <Mail aria-hidden="true" className="size-6 shrink-0" />
                <span className="label-brutal hidden max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-[96px] group-focus-visible:ml-2 group-focus-visible:max-w-[96px] sm:block">
                  Email us
                </span>
              </motion.span>
            </motion.a>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default FloatingContactButtons;
