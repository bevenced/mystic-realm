import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/blog",
  "/chat",
  "/offline",
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
  "/compatibility",
  "/about",
  "/faq",
  "/changelog",
  "/bazi",
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

  // API routes: let route handlers manage auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Page routes: redirect to sign-in if not authenticated
  const session = request.cookies.get("session");
  if (!session?.value) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next|favicon.ico).*)", "/(api|trpc)(.*)"],
};
