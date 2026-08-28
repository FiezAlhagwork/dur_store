/**
 * Query keys for the dashboard. Same contract as `categoryKeys` and
 * `productKeys`: build every key here, never inline `["dashboard"]`.
 *
 * The `all()` prefix matters more here than elsewhere — product and category
 * writes invalidate it (see hooks/useProducts.ts and hooks/useCategories.ts)
 * because every number on the dashboard is derived from those two entities.
 */
export const dashboardKeys = {
  all: () => ["dashboard"] as const,

  stats: () => [...dashboardKeys.all(), "stats"] as const,
};
