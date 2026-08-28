"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AdminDrawer from "./AdminDrawer";
import AdminNav from "./AdminNav";
import AdminTopbar from "./AdminTopbar";
import Button from "@/components/ui/Button";
import { getLocalizedAdminNavLinks } from "@/constants/admin-nav";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { ApiError } from "@/lib/api/errors";

/**
 * The frame every admin page sits in: section rail, top bar, and the role
 * check that decides whether any of it should render at all.
 *
 * Direction is never branched here. The outer element is a plain flex row, so
 * `dir="rtl"` (set once in app/[locale]/layout.tsx) puts the rail on the right
 * in Arabic and the left in English on its own, and the rest uses logical
 * properties — `border-e`, `ms-*`. The one exception lives in `AdminDrawer`,
 * where a transform has no logical equivalent.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const pathname = usePathname();
  const router = useRouter();

  const { isCollapsed, toggle } = useSidebarCollapsed();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const { data: user, error, isError, refetch } = useCurrentUser();
  const is401 = isError && error instanceof ApiError && error.status === 401;
  const isNotAdmin = !!user && user.role !== "admin";

  const navItems = useMemo(
    () => getLocalizedAdminNavLinks(locale, t, pathname ?? ""),
    [locale, t, pathname],
  );
  const activeItem = navItems.find((item) => item.isActive);

  // An expired or rejected token means signing in again, exactly as on
  // /redirect-after-login.
  useEffect(() => {
    if (is401) router.replace(`/${locale}/login`);
  }, [is401, router, locale]);

  /*
   * A signed-in customer who types /dashboard is sent home.
   *
   * This is a usability guard, not a security boundary: the real protection is
   * that Laravel rejects a non-admin token outright (403 on
   * /api/dashboard/stats, already handled via `ApiError.isForbidden`). It
   * costs nothing here — the role was fetched at login and React Query still
   * has it cached, so there is normally no extra request.
   */
  useEffect(() => {
    if (isNotAdmin) router.replace(`/${locale}`);
  }, [isNotAdmin, router, locale]);

  if (isError && !is401) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-serif text-xl font-bold text-primary">
          {t("admin.guard.errorTitle")}
        </h1>
        <p className="max-w-sm text-sm text-foreground/60">
          {t("admin.guard.errorDescription")}
        </p>
        <Button type="button" onClick={() => refetch()}>
          {t("admin.guard.errorRetry")}
        </Button>
      </div>
    );
  }

  // Still resolving, or already redirecting: render nothing rather than
  // flashing the admin frame at someone who is not allowed to see it.
  if (!user || isNotAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <p className="text-sm text-foreground/60">{t("admin.guard.checking")}</p>
      </div>
    );
  }

  const brand = (
    <Link
      href={`/${locale}`}
      className="flex items-center justify-center py-2"
      aria-label={t("nav.home")}
    >
      <Image
        src="/erer.png"
        alt="DUR"
        width={36}
        height={36}
        priority
        className="object-contain"
      />
    </Link>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={[
          "sticky top-0 hidden h-dvh shrink-0 flex-col gap-4 border-e border-primary/10 bg-second/30 p-3 lg:flex",
          "transition-[width] duration-300 ease-out",
          isCollapsed ? "w-18" : "w-64",
        ].join(" ")}
      >
        {brand}
        <AdminNav items={navItems} isCollapsed={isCollapsed} />
      </aside>

      {/* Same nav, never collapsed — a drawer has the room for labels. */}
      <AdminDrawer isOpen={isDrawerOpen} onClose={closeDrawer}>
        <div className="flex flex-1 flex-col gap-4 p-3">
          {brand}
          <AdminNav
            items={navItems}
            isCollapsed={false}
            onNavigate={closeDrawer}
          />
        </div>
      </AdminDrawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          title={activeItem?.label ?? t("admin.nav.dashboard")}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggle}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
