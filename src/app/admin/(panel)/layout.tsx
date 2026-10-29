import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { SITE_IDENTITY } from "@/lib/constants";
import {
  AdminMobileNav,
  AdminSidebarNav,
} from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { Button } from "@/components/ui/button";

/**
 * Auth-gated admin chrome. `requireAdmin()` redirects to /admin/login when the
 * session is missing — the public login page lives OUTSIDE this route group,
 * so there is no redirect loop.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="sticky top-0 z-40 hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-cream lg:flex lg:h-dvh">
        <div className="border-b border-cream/20 px-4 py-5">
          <Link href="/admin/dashboard" className="block">
            <span className="label-brutal text-lemon">Admin</span>
            <span className="mt-1 block font-display text-lg uppercase leading-tight">
              {SITE_IDENTITY.name}
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <AdminSidebarNav />
        </div>

        <div className="border-t border-cream/20 p-4">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-cream/80">
            {user.name || user.email}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-cream/60">
            {user.email} · {user.role}
          </p>
          <div className="mt-3">
            <LogoutButton variant="danger" size="sm" className="w-full" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-butter">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <span className="label-brutal text-ink-soft lg:hidden">Admin</span>
              <p className="truncate font-display text-sm uppercase lg:text-base">
                {SITE_IDENTITY.name} · Control room
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                  View site
                </Link>
              </Button>
              <div className="lg:hidden">
                <LogoutButton showLabel={false} variant="danger" />
              </div>
            </div>
          </div>
          <AdminMobileNav className="lg:hidden" />
        </header>

        <main className="flex-1 bg-cream px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
