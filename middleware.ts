import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type TokenPayload = { role?: string; email?: string };

const adminWhitelist = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const decodeTokenPayload = (token: string): TokenPayload | null => {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const normalized = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  const tokenPayload = token ? decodeTokenPayload(token) : null;

  // 1. Protected user routes (require token)
  const protectedRoutes = ["/dashboard", "/history", "/ask-doubt", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin routes (require admin token)
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiRoute = pathname.startsWith("/api/admin/");

  if (isAdminRoute || isAdminApiRoute) {
    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const isAdmin =
      tokenPayload?.role === "admin" ||
      (tokenPayload?.email
        ? adminWhitelist.has(tokenPayload.email.toLowerCase())
        : false);

    if (!isAdmin) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Auth routes (redirect to dashboard if already logged in)
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Matching Paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/ask-doubt/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
