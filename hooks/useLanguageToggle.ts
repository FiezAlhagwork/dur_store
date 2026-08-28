"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

/**
 * Switches between the two locales while staying on the current page.
 *
 * The same handful of lines was written out in both `Navbar` and
 * `NavbarOverlay`; the admin topbar would have been a third copy. Callers that
 * need to do something else as well (close a menu, for instance) compose
 * around the returned function.
 */
export function useLanguageToggle() {
  const { i18n } = useTranslation("common");
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(() => {
    const nextLocale = i18n.resolvedLanguage === "ar" ? "en" : "ar";
    const currentPath = pathname || "/";
    const pathWithoutLocale = currentPath.replace(/^\/(en|ar)(?=\/|$)/, "");
    const nextPath = `/${nextLocale}${
      pathWithoutLocale === "/" ? "" : pathWithoutLocale
    }`;

    router.push(nextPath);
  }, [i18n.resolvedLanguage, pathname, router]);
}
