import type { Category, Product, ProductImage } from "@/types/product";

/**
 * Shapes for `GET /api/dashboard/stats`.
 *
 * Verified against a real `200` response. Everything the docs described was
 * confirmed — the three counters, the filled-in `products_count` on each
 * category, the eager-loaded `category` on each product — with one exception,
 * documented on `DashboardProduct` below.
 */

/** The three counters under `products_count`. */
export interface DashboardProductsCount {
  total: number;
  active: number;
  inactive: number;
}

/**
 * A category as it appears in `products_by_category`.
 *
 * This endpoint is the only place the docs say `products_count` comes back
 * filled in — it is absent or null everywhere else. So the guarantee is
 * modelled here instead of making the field required on `Category`, which
 * would make every other endpoint look like it returns a count it does not.
 */
export type CategoryWithProductCount = Category & { products_count: number };

/**
 * A product as *this* endpoint sends it, which is not quite a `Product`.
 *
 * Confirmed from a real response: `category` is eager-loaded, but `images` is
 * **absent entirely** — the key is missing, not an empty array, which means
 * Laravel never loaded the relation. So these rows have no thumbnail to show
 * today. If the dashboard should display product images, that has to be fixed
 * in the API by eager-loading `images` on these two lists; there is nothing
 * this app can do about it.
 *
 * Typed as optional rather than removed, so that the day the API does include
 * them, thumbnails start rendering with no change needed here. It is a
 * separate type from `Product` for the same reason `ToggledProduct` is: so a
 * value that has no images can never be passed somewhere that requires them
 * (`ProductGallery` would throw on `[...undefined]`).
 */
export type DashboardProduct = Omit<Product, "images"> & {
  images?: ProductImage[];
};

export interface DashboardStats {
  products_count: DashboardProductsCount;
  products_by_category: CategoryWithProductCount[];
  /** Products whose `stock` is under 5, lowest stock first. */
  low_stock_products: DashboardProduct[];
  /** The 10 most recently added products, newest first. */
  latest_products: DashboardProduct[];
}
