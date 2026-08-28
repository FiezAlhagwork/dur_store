import type { ProductFilters } from "@/types/product";

/**
 * Query keys for the product entity. Same contract as `categoryKeys`: build
 * every key here so `productKeys.all()` invalidates the whole entity at once.
 *
 * `lists()` takes the filters object because a filtered list is a distinct
 * cache entry — `?category_id=1` and `?category_id=2` must not share one.
 */
export const productKeys = {
  all: () => ["products"] as const,

  lists: (filters?: ProductFilters) =>
    [...productKeys.all(), "list", filters ?? null] as const,

  /**
   * Separate from `lists()`, not a variant of it. `useInfiniteQuery` caches an
   * `{ pages, pageParams }` structure, entirely unlike the single
   * `Paginated<Product>` a plain `useQuery` stores — sharing a key between the
   * two would mean whichever hook reads second gets the other's shape.
   */
  infiniteLists: (filters?: Omit<ProductFilters, "page">) =>
    [...productKeys.all(), "infinite-list", filters ?? null] as const,

  detail: (idOrSlug: number | string) =>
    [...productKeys.all(), "detail", idOrSlug] as const,
};
