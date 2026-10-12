"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  FileText,
  HelpCircle,
  Images,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  MapPin,
  Newspaper,
  Package,
  Route,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/destinations", label: "Destinations", icon: MapPin },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/trip-types", label: "Trip Types", icon: Route },
  { href: "/admin/guides", label: "Guides", icon: BookOpen },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: LayoutGrid },
  { href: "/admin/home-sections", label: "Home Sections", icon: LayoutList },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/inquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/newsletters", label: "Newsletter", icon: Newspaper },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Vertical nav for the desktop sidebar. */
export function AdminSidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className={cn("flex flex-col gap-1", className)}>
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 border-[3px] px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
              active
                ? "border-ink bg-lemon text-ink shadow-hard-xs"
                : "border-transparent text-cream hover:border-cream hover:bg-ink-soft/40",
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontally scrollable nav for tablets and phones. */
export function AdminMobileNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className={cn("no-scrollbar flex gap-2 overflow-x-auto px-3 pb-2", className)}
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-[3px] border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-hard-xs",
              active ? "bg-lemon" : "bg-paper hover:bg-butter",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
