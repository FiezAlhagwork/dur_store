/**
 * Query keys for site settings. Same contract as `categoryKeys`,
 * `productKeys` and `dashboardKeys`: build every key here, never inline
 * `["settings"]` at a call site.
 *
 * Settings are a singleton rather than a collection, so there is no `lists()`
 * or `detail(id)` — `current()` is the only query there is. `all()` still
 * exists as the invalidation prefix, matching `dashboardKeys`.
 */
export const settingsKeys = {
  all: () => ["settings"] as const,

  current: () => [...settingsKeys.all(), "current"] as const,
};
