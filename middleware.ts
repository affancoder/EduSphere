import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Protected routes (require token)
  const protectedRoutes = ["/dashboard", "/history", "/ask-doubt", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth routes (redirect to dashboard if already logged in)
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
    "/reset-password"
  ],
};
