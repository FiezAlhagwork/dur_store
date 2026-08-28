// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same clerkMiddleware()
// API, only the file name / exported function name changed — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// and Clerk's own docs, which already document this rename).
//
// This only propagates the Clerk session (so `auth()` works in Server
// Components/layouts below) — it does NOT gate any routes itself.
// `createRouteMatcher()` + `auth.protect()` here is Clerk's now-deprecated
// path-matching pattern; route protection lives next to what it protects
// instead (see app/[locale]/(admin)/layout.tsx for the admin guard).
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static assets, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
