import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blog(.*)",
  "/shop(.*)",
  "/theme(.*)",
  "/api/paypal(.*)",
  "/api/ai-(.*)",
  "/api/db(.*)",
]);

// Define ignored routes (no auth check at all)
const isIgnoredRoute = createRouteMatcher(["/api/ai-(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Skip auth for ignored routes (AI APIs use orderId verification)
  if (isIgnoredRoute(request)) return;

  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next|favicon.ico).*)", "/(api|trpc)(.*)"],
};
