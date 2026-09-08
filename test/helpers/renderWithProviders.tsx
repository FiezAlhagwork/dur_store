import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import I18nProvider from "@/components/providers/I18nProvider";
import type { Locale } from "@/i18n/config";

/**
 * `renderWithI18n` plus a React Query client, for components that reach for
 * a query/mutation hook (`ProductsTable` → `useToggleProductActive`, say)
 * and would otherwise throw "No QueryClient set".
 *
 * A brand-new client per call, with retries off: a test that does trigger a
 * request should fail immediately and visibly rather than silently retrying
 * for seconds, and no cached data can leak from one test into the next.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    locale = "ar",
    ...options
  }: Omit<RenderOptions, "wrapper"> & { locale?: Locale } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </QueryClientProvider>
    ),
    ...options,
  });
}
