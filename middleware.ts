import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
// AI routes are public to allow anonymous preview, but auth is checked inside routes for paid features
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blog(.*)",
  "/membership(.*)",
  "/shop(.*)",
  "/tools(.*)",
  "/theme(.*)",
  "/api/paypal(.*)",
  "/api/ai-(.*)",
  // NOTE: /api/db is NOT public - requires auth for init
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect non-public routes (e.g., /api/db/init, /dashboard, etc.)
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next|favicon.ico).*)", "/(api|trpc)(.*)"],
};
