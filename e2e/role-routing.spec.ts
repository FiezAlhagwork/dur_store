import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

/**
 * `/redirect-after-login`'s whole job, per CLAUDE.md: after a session
 * exists, fetch the role from Laravel and send an admin to `/dashboard`,
 * everyone else to `/`. This is the one place role is ever checked — get it
 * wrong here and either an admin gets stuck on the customer view or a
 * customer ends up somewhere they shouldn't.
 *
 * `clerk.signIn({ emailAddress, page })` establishes a real session via
 * Clerk's Backend API (a ticket-based sign-in), bypassing the app's own
 * method/email/code UI entirely — deliberately: this suite is about what
 * happens *after* a session exists, not about the sign-in form itself (see
 * auth-flow.spec.ts for that). It requires a page that already loaded
 * Clerk, hence the `page.goto("/ar")` before it in every test.
 */
test.describe("role-based routing after login", () => {
  test("customer login routes to home, not the dashboard", async ({ page }) => {
    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_CUSTOMER_EMAIL!,
    });

    await page.goto("/ar/redirect-after-login");
    await page.waitForURL("/ar");
  });

  test("admin login routes to the dashboard", async ({ page }) => {
    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_ADMIN_EMAIL!,
    });

    await page.goto("/ar/redirect-after-login");
    await page.waitForURL("/ar/dashboard");

    // AdminShell's own role check (see dashboard-guard.spec.ts) fires right
    // after landing and would bounce a non-admin straight back to `/ar`. The
    // sidebar/topbar only render once that check has actually passed, so
    // waiting for a piece of it is what proves the role was really "admin" —
    // not just that /redirect-after-login picked the right URL once.
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page).toHaveURL("/ar/dashboard");
  });
});
