import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

/**
 * Fast, dependency-free gate for the admin area.
 * The cookie is only checked for presence here (edge-safe); the JWT itself is
 * verified in the admin layout via `requireAdmin()`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    if (hasSessionCookie(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !hasSessionCookie(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // /design-system: dev is open (NODE_ENV inlined per build); in production a
  // session cookie is required at the edge, and the page re-checks the JWT.
  if (pathname === "/design-system") {
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev && !hasSessionCookie(request)) {
      return NextResponse.rewrite(new URL("/design-system-gated", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/design-system"],
};
