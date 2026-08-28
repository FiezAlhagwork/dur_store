/**
 * Query keys for the category entity.
 *
 * Always build keys through this factory — never inline `["categories"]` at a
 * call site. Every key starts with the same `all()` prefix, so invalidating
 * `categoryKeys.all()` after a mutation reliably refreshes every list and
 * detail query, with no chance of a hand-written key drifting out of sync.
 */
export const categoryKeys = {
  all: () => ["categories"] as const,

  lists: (filters?: unknown) =>
    [...categoryKeys.all(), "list", filters ?? null] as const,

  detail: (id: number) => [...categoryKeys.all(), "detail", id] as const,
};
