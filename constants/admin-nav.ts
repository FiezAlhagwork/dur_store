import type { TFunction } from "i18next";
import { Gem, LayoutDashboard, Store, Tags, UserCog } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { AdminNavItem } from "@/types";

/**
 * The section every other admin route hangs off. Matched exactly rather than
 * by prefix — see `getLocalizedAdminNavLinks`.
 */
export const ADMIN_ROOT_HREF = "/dashboard";

/**
 * Sections of the admin area.
 *
 * They are nested under `/dashboard` rather than sitting at the top level
 * because route groups add nothing to the URL: an `(admin)/products` route
 * would resolve to the same `/[locale]/products` as the public catalogue in
 * `(site)` and fail the build with a duplicate-route error.
 */
/*
 * The last two used to be a single "Settings" entry, which put two unrelated
 * things behind one word: what the *shop* shows its customers, and what the
 * *person* signed in has set for themselves. Splitting them means an admin
 * looking for the hero video is not opening the page about their own avatar.
 */
export const ADMIN_NAV_LINKS = [
  { labelKey: "admin.nav.dashboard", href: ADMIN_ROOT_HREF, icon: LayoutDashboard },
  { labelKey: "admin.nav.categories", href: "/dashboard/categories", icon: Tags },
  { labelKey: "admin.nav.products", href: "/dashboard/products", icon: Gem },
  { labelKey: "admin.nav.site", href: "/dashboard/site", icon: Store },
  { labelKey: "admin.nav.account", href: "/dashboard/account", icon: UserCog },
] as const;

/**
 * Builds the localised, href-resolved links with their active state already
 * worked out, so the nav components stay presentational.
 */
export function getLocalizedAdminNavLinks(
  locale: Locale,
  t: TFunction,
  pathname: string,
): AdminNavItem[] {
  return ADMIN_NAV_LINKS.map((link) => {
    const href = `/${locale}${link.href}`;

    return {
      label: t(link.labelKey),
      href,
      icon: link.icon,
      // `/ar/dashboard` is a prefix of every other section, so a plain
      // `startsWith` would leave the overview permanently highlighted.
      isActive:
        link.href === ADMIN_ROOT_HREF
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`),
    };
  });
}
