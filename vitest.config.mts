import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Unit tests — plain logic (schema validation, `lib/auth/orchestration.ts`,
 * `utils/*`) and now component tests (`@testing-library/react`) share one
 * `jsdom` environment rather than splitting into two configs: jsdom is a
 * superset of plain Node for this suite's purposes, so the existing
 * logic-only tests run unchanged under it. This is deliberately separate
 * from the E2E setup (playwright.config.ts): Playwright drives a real
 * browser against a running app for full user flows, this renders
 * components (or runs plain functions) in isolation, mocking only at the
 * real boundary (Clerk's SDK, axios errors, browser APIs jsdom lacks — see
 * test/setup.ts). `testDir`s don't overlap, so `vitest run` and
 * `playwright test` never pick up each other's files.
 *
 * The `@/*` alias mirrors tsconfig.json's `paths` — Vitest doesn't read
 * tsconfig path mappings on its own, so source files that import via `@/...`
 * would otherwise fail to resolve under Vitest even though they compile fine
 * under Next.js. Test files use the same alias to reach the source they're
 * testing (e.g. `@/lib/auth/orchestration`) rather than a relative path, so
 * a test's location under `test/` never has to track how deeply nested the
 * source it covers is.
 *
 * Every test file lives under `test/`, mirroring the project's own folder
 * structure one-to-one (e.g. `components/admin/products/ProductForm.tsx` →
 * `test/components/admin/products/ProductForm.test.tsx`) instead of sitting
 * next to the file it covers — keeps source directories free of test files
 * and gives the whole suite one place to look.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
