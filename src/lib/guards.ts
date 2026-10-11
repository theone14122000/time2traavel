import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

/** Server-side guard used by the admin layout and every admin server action. */
export async function requireAdmin(): Promise<{
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
}> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect("/admin/login");
  }
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    role: user.role ?? "ADMIN",
  };
}

export async function requireRole(role: Role) {
  const user = await requireAdmin();
  if (user.role !== role) {
    redirect("/admin?unauthorized=1");
  }
  return user;
}

/** Returns the session user or null — for non-blocking checks. */
export async function getAdminOrNull() {
  const session = await auth();
  return session?.user ?? null;
}
