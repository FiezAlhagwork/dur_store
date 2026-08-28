import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Resource-based auth guard for all `(admin)` routes (e.g. /dashboard),
 * per Clerk's current guidance — `proxy.ts` only propagates the session,
 * it no longer gates routes via `createRouteMatcher()`/`auth.protect()`
 * (that pattern is deprecated).
 *
 * This only checks that a session exists. The `role` check happens one level
 * down, in `AdminShell`, which reads it from the React Query cache that
 * /redirect-after-login already filled — so a signed-in customer who types
 * /dashboard is sent home without this layout paying for a Laravel round trip
 * on every admin page load.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { userId } = await auth();
  const { locale } = await params;

  if (!userId) {
    redirect(`/${locale}/login`);
  }

  return <AdminShell>{children}</AdminShell>;
}
