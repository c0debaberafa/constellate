// middleware.ts (in your project root)

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Declare public routes using a route matcher
// These paths will NOT require authentication.
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk", // Clerk will skip auth for this path
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/api/(.*)", // Simplified matcher
  ],
};
