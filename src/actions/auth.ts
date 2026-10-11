"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema, type LoginInput } from "@/schemas/forms";
import type { ActionResult } from "@/actions/inquiry";

export async function loginAction(
  values: LoginInput,
  redirectTo?: string,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Enter a valid email and password.",
      fieldErrors: parsed.error.issues.reduce<Record<string, string[]>>(
        (acc, issue) => {
          const key = issue.path.join(".") || "_form";
          (acc[key] ??= []).push(issue.message);
          return acc;
        },
        {},
      ),
    };
  }

  const h = await headers();
  const ip = await getClientIp(h);
  const limit = rateLimit({
    key: "admin-login",
    limit: 8,
    windowMs: 15 * 60 * 1000,
    ip,
  });
  if (!limit.success) {
    return {
      ok: false,
      error: `Too many login attempts — try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    console.error(
      "[auth] unexpected login error:",
      error instanceof Error ? error.message : error,
    );
    return { ok: false, error: "Login failed. Please try again." };
  }

  const safeTarget =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/admin";

  // `redirect()` throws internally — that is expected in server actions.
  const { redirect } = await import("next/navigation");
  redirect(safeTarget);
  return { ok: true, message: "Signed in." };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}
