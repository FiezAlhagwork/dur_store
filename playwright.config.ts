import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

/*
 * Both files are loaded here, in the one orchestrator process, before
 * `defineConfig` runs and before Playwright forks a worker for either
 * project — so "global setup" and "chromium" both inherit everything.
 * Relying on `clerkSetup()` to do it is not enough: it only auto-loads
 * `.env.local`/`.env` (hardcoded as `dotenv.config({ path: [".env.local",
 * ".env"] })`, confirmed by reading its source — never `.env.test`), and it
 * runs inside the setup worker, so nothing it loads is guaranteed to reach
 * the worker that actually runs the specs.
 *
 * The split between the two files is deliberate:
 *
 *   .env.test   — only what is specific to testing: which accounts the
 *                 suite signs in as, and where it points. Never leaves a
 *                 developer machine, and its absence on a server is what
 *                 stops this suite — which creates and deletes real
 *                 products and categories — from ever being pointed at
 *                 production data.
 *   .env.local  — the Clerk keys, shared with the dev server the tests
 *                 drive. Read from here rather than copied into
 *                 `.env.test` so there is one source of truth: two copies
 *                 can drift, and a drifted key means the tests mint
 *                 sign-in tokens on a different Clerk instance than the app
 *                 is using, which fails in a thoroughly confusing way.
 *
 * Order matters. `dotenv` never overwrites a variable that is already set,
 * so `.env.test` is loaded first and wins wherever the two overlap.
 */
config({ path: '.env.test' });
config({ path: '.env.local' });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /*
   * Default is 30s. Reproduced directly: the same test that hangs at exactly
   * 30s headed+slowMo (below) passes in 22.7s headless with no slowMo — so
   * `/dashboard` is already close to the ceiling in this dev environment on
   * its own (first-load bundle size, not a Clerk flake), and slowMo tips
   * tests that touch it over the edge. Raised globally rather than per-test,
   * since any spec that visits `/dashboard` is affected, not just one.
   */
  timeout: 60_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /*
   * Forced to 1 everywhere, not just CI. This whole suite authenticates as
   * one of exactly two shared Clerk test accounts (E2E_CUSTOMER_EMAIL /
   * E2E_ADMIN_EMAIL). Confirmed by reproducing it: with the default
   * (parallel) workers, two tests signing in as the same account at the same
   * moment intermittently fails `clerk.signIn` with an unhelpful blank
   * error — Clerk's backend doesn't like concurrent sign-in-token requests
   * for one user. Running everything with `--workers=1` made all 6 tests
   * pass reliably; this makes that the default instead of something you
   * have to remember to type.
   */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /*
     * Headless only on CI. Locally, always open a real browser window and
     * slow every action down enough to actually watch it — filling a field,
     * clicking a button, a row appearing or disappearing — instead of it
     * happening invisibly in under a second. Means `npx playwright test`
     * alone is enough; no one has to remember to add `--headed`.
     */
    headless: !!process.env.CI,
    launchOptions: {
      slowMo: process.env.CI ? 0 : 300,
    },
  },

  /* Configure projects */
  projects: [
    {
      name: 'global setup',
      testMatch: /global\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['global setup'],
    },
  ],
});
