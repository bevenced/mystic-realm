import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/blog",
  "/membership",
  "/shop",
  "/tools",
  "/theme",
  "/api/paypal",
  "/api/ai-",
  "/api/auth",
  "/api/db/init",
  "/privacy",
  "/terms",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/") || pathname.startsWith(route + "?"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const session = getSessionUserFromRequest(request);

  // API routes: return 401 if not authenticated
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Page routes: redirect to sign-in if not authenticated
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next|favicon.ico).*)", "/(api|trpc)(.*)"],
};
