import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

/**
 * Public admin login — intentionally OUTSIDE the `(panel)` route group so the
 * auth-gated layout never wraps it (no redirect loop).
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <LoginForm redirectTo={from} />;
}
