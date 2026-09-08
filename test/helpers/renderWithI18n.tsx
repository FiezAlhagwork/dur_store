import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import I18nProvider from "@/components/providers/I18nProvider";
import type { Locale } from "@/i18n/config";

/**
 * Renders a component inside the app's **real** `I18nProvider`, not a mocked
 * `useTranslation`.
 *
 * Two reasons for the real one:
 *
 * 1. `I18nProvider` already builds a fresh i18next instance per render tree
 *    (`useMemo` + `createInstance()` — see its own comment for why the old
 *    shared singleton was a bug). That means no state leaks between tests,
 *    which is exactly the property a test helper needs anyway.
 * 2. Assertions can then match the **real** Arabic/English copy from
 *    `i18n/locales/<locale>/common.json` instead of raw keys — so a deleted
 *    or renamed translation key fails a test instead of silently rendering
 *    a key string to a customer.
 *
 * Returns whatever `render` returns, so `rerender`, `unmount`, etc. all work
 * as usual.
 */
export function renderWithI18n(
  ui: ReactElement,
  {
    locale = "ar",
    ...options
  }: Omit<RenderOptions, "wrapper"> & { locale?: Locale } = {},
) {
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider locale={locale}>{children}</I18nProvider>
    ),
    ...options,
  });
}
