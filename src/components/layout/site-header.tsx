"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowRight, Compass, Mail, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { telHref, waHref } from "@/lib/contact";
import { EASE, fadeUp, slideIn, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import type { SiteSettingsShape } from "@/lib/data/site";

export type HeaderDestination = {
  slug: string;
  name: string;
  state: string;
};

type SiteHeaderProps = {
  settings: SiteSettingsShape;
  /** Published destinations (DB rows) rendered in the desktop mega menu. */
  destinations?: HeaderDestination[];
};

const DESTINATIONS_PANEL_ID = "site-header-destinations-panel";
/** Grace period so the pointer can cross from trigger to panel without a flicker. */
const MEGA_CLOSE_DELAY_MS = 140;

export function SiteHeader({ settings, destinations = [] }: SiteHeaderProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const { openPlanner } = useTripPlanner();

  const megaCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaTriggerRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    setScrolled(window.scrollY > 24);
    return () => {
      if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    };
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 24;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  const clearMegaTimer = React.useCallback(() => {
    if (megaCloseTimer.current) {
      clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  }, []);

  const openMega = React.useCallback(() => {
    clearMegaTimer();
    setMegaOpen(true);
  }, [clearMegaTimer]);

  const scheduleMegaClose = React.useCallback(() => {
    clearMegaTimer();
    megaCloseTimer.current = setTimeout(() => {
      megaCloseTimer.current = null;
      setMegaOpen(false);
    }, MEGA_CLOSE_DELAY_MS);
  }, [clearMegaTimer]);

  const closeMega = React.useCallback(
    (refocus: boolean) => {
      clearMegaTimer();
      setMegaOpen(false);
      if (refocus) megaTriggerRef.current?.focus();
    },
    [clearMegaTimer],
  );

  React.useEffect(() => {
    if (!megaOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMega(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [megaOpen, closeMega]);

  const whatsappUrl = settings.whatsapp
    ? waHref(settings.whatsapp, "Hello Time to Travel, I would like to plan a trip.")
    : null;

  const phoneHref = settings.phone
    ? telHref(settings.phone) ?? `tel:${settings.phone.replace(/[^\d+]/g, "")}`
    : null;

  const contactRows = [
    settings.phone && phoneHref
      ? {
          icon: Phone,
          label: settings.phone,
          href: phoneHref,
          external: false,
        }
      : null,
    whatsappUrl
      ? { icon: MessageCircle, label: "Chat on WhatsApp", href: whatsappUrl, external: true }
      : null,
    settings.email
      ? { icon: Mail, label: settings.email, href: `mailto:${settings.email}`, external: false }
      : null,
    settings.address
      ? { icon: MapPin, label: settings.address, href: "/about-us#contact", external: false }
      : null,
  ].filter(Boolean) as {
    icon: typeof Phone;
    label: string;
    href: string;
    external: boolean;
  }[];

  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);

  const navLinkClass = (active: boolean) =>
    cn(
      "label-brutal relative border-[3px] border-transparent px-3 py-2.5 transition-all hover:border-ink hover:bg-butter hover:shadow-hard-xs",
      active && "border-ink bg-paper shadow-hard-xs",
    );

  return (
    <>
      <ScrollProgress />

      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b-[3px] border-ink bg-cream/95 backdrop-blur transition-shadow duration-300 ease-out",
          scrolled && "shadow-hard-sm",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-[90rem] items-center justify-between gap-3 px-4 transition-[height] duration-300 ease-out sm:px-6 lg:px-10 xl:px-14",
            scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20",
          )}
        >
          <Link href="/" aria-label="Time to Travel — home" className="shrink-0">
            <span
              className={cn(
                "inline-flex origin-left items-center gap-2 border-[3px] border-ink bg-lemon px-2.5 py-1.5 shadow-hard-xs transition-transform duration-300 ease-out hover:-translate-y-0.5",
                scrolled && "scale-90",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-6 items-center justify-center border-[2px] border-ink bg-ink font-display text-[0.7rem] leading-none text-cream"
              >
                T
              </span>
              <span className="font-display text-sm uppercase leading-none tracking-tight sm:text-base">
                Time to Travel
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              const isDestinations = link.href === "/destinations";

              if (!isDestinations) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active)}
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-0.5 h-[3px] bg-lemon"
                      />
                    ) : null}
                  </Link>
                );
              }

              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={scheduleMegaClose}
                  onFocus={openMega}
                  onBlur={(event) => {
                    const next = event.relatedTarget;
                    if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
                      closeMega(false);
                    }
                  }}
                >
                  <Link
                    ref={megaTriggerRef}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={megaOpen}
                    aria-controls={DESTINATIONS_PANEL_ID}
                    className={navLinkClass(active)}
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-0.5 h-[3px] bg-lemon"
                      />
                    ) : null}
                  </Link>

                  <AnimatePresence>
                    {megaOpen ? (
                      <motion.div
                        id={DESTINATIONS_PANEL_ID}
                        initial={reduceMotion ? false : "hidden"}
                        animate="visible"
                        exit={
                          reduceMotion
                            ? { opacity: 0, transition: { duration: 0 } }
                            : { opacity: 0, y: -16, transition: { duration: 0.2, ease: EASE } }
                        }
                        variants={slideIn("top", 24)}
                        className="absolute left-0 top-full z-50 w-[min(44rem,calc(100vw_-_3rem))] border-[3px] border-ink bg-paper p-4 shadow-hard-lg sm:p-5"
                      >
                        <p className="label-brutal mb-3 text-ink-soft">Browse destinations</p>

                        {destinations.length > 0 ? (
                          <>
                            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {destinations.map((destination) => (
                                <li key={destination.slug}>
                                  <Link
                                    href={`/destinations/${destination.slug}`}
                                    onClick={() => closeMega(false)}
                                    className="flex h-full flex-col gap-1 border-[2px] border-ink bg-paper px-3 py-2.5 transition-colors hover:bg-butter"
                                  >
                                    <span className="font-display text-sm uppercase leading-tight">
                                      {destination.name}
                                    </span>
                                    <span className="label-brutal text-[0.6rem] text-ink-soft">
                                      {destination.state}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>

                            <div className="mt-4 flex items-center justify-end border-t-[3px] border-ink pt-3">
                              <Link
                                href="/destinations"
                                onClick={() => closeMega(false)}
                                className="label-brutal inline-flex items-center gap-1.5 border-[2px] border-ink bg-lemon px-3 py-2 shadow-hard-xs transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard"
                              >
                                View all
                                <ArrowRight aria-hidden="true" className="size-3.5" />
                              </Link>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-semibold">
                            New destinations coming soon.{" "}
                            <Link
                              href="/about-us"
                              onClick={() => closeMega(false)}
                              className="underline decoration-2 underline-offset-4 hover:bg-lemon"
                            >
                              About Us
                            </Link>{" "}
                            to plan a trip.
                          </p>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {phoneHref ? (
              <a
                href={phoneHref}
                className="hidden size-10 items-center justify-center border-[3px] border-ink bg-paper shadow-hard-xs transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard sm:flex"
                aria-label={`Call ${settings.siteName}`}
              >
                <Phone aria-hidden="true" className="size-4" />
              </a>
            ) : null}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden size-10 items-center justify-center border-[3px] border-ink bg-mint-strong shadow-hard-xs transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard sm:flex"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
              </a>
            ) : null}

            <Button
              type="button"
              size="md"
              className="hidden sm:inline-flex"
              magnetic
              onClick={() => openPlanner()}
            >
              <Compass aria-hidden="true" className="size-4" />
              Plan My Trip
            </Button>

            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  className="flex size-11 items-center justify-center border-[3px] border-ink bg-paper shadow-hard-xs transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard lg:hidden"
                >
                  {menuOpen ? (
                    <X aria-hidden="true" className="size-5" />
                  ) : (
                    <Menu aria-hidden="true" className="size-5" />
                  )}
                </button>
              </DialogTrigger>

              <DialogContent className="fixed inset-0 left-0 top-0 z-50 h-dvh max-h-none w-full max-w-none translate-x-0 translate-y-0 border-0 bg-paper p-0 shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">Navigation menu</DialogTitle>

                <motion.div
                  initial={reduceMotion ? false : "hidden"}
                  animate="visible"
                  variants={stagger(0.05)}
                  className="flex min-h-full flex-col bg-paper"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-[3px] border-ink bg-lemon px-4 py-3">
                    <Link
                      href="/"
                      aria-label="Time to Travel — home"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-2.5 py-1.5 shadow-hard-xs"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-6 items-center justify-center border-[2px] border-ink bg-ink font-display text-[0.7rem] leading-none text-cream"
                      >
                        T
                      </span>
                      <span className="font-display text-sm uppercase leading-none sm:text-base">
                        Time to Travel
                      </span>
                    </Link>

                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setMenuOpen(false)}
                      className="tap-44 flex size-11 items-center justify-center border-[3px] border-ink bg-paper shadow-hard-xs transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard"
                    >
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </div>

                  <nav aria-label="Mobile" className="grid gap-2.5 p-4 sm:p-6">
                    {NAV_LINKS.map((link) => {
                      const active = isActive(link.href);
                      return (
                        <motion.div key={link.href} variants={fadeUp}>
                          <Link
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "relative flex items-center justify-between gap-3 overflow-hidden border-[3px] border-ink py-4 pl-7 pr-4 font-display text-xl uppercase transition-all sm:text-2xl",
                              active
                                ? "bg-paper shadow-hard-sm"
                                : "bg-paper hover:bg-butter hover:shadow-hard-xs",
                            )}
                          >
                            {active ? (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-0 left-0 w-2.5 bg-lemon"
                              />
                            ) : null}
                            <span>{link.label}</span>
                            <span aria-hidden="true">→</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  <div className="mt-auto grid gap-3 px-4 pb-8 sm:px-6">
                    <motion.div variants={fadeUp}>
                      <Button
                        type="button"
                        size="lg"
                        className="w-full"
                        onClick={() => {
                          setMenuOpen(false);
                          openPlanner();
                        }}
                      >
                        <Compass aria-hidden="true" className="size-4" />
                        Plan My Trip
                      </Button>
                    </motion.div>

                    {contactRows.length > 0 ? (
                      <motion.div
                        variants={fadeUp}
                        className="grid gap-2 border-t-[3px] border-ink pt-4"
                      >
                        {contactRows.map((row) => (
                          <a
                            key={row.label}
                            href={row.href}
                            onClick={() => setMenuOpen(false)}
                            target={row.external ? "_blank" : undefined}
                            rel={row.external ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 rounded-chip border-[3px] border-ink bg-paper px-4 py-3 text-sm font-semibold transition-colors hover:bg-butter"
                          >
                            <row.icon aria-hidden="true" className="size-4 shrink-0" />
                            <span className="truncate">{row.label}</span>
                          </a>
                        ))}
                      </motion.div>
                    ) : null}
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
    </>
  );
}
