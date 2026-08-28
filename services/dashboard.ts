import { apiClient, authHeader } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";
import { normalizeProduct } from "@/services/products";
import type { Category } from "@/types/product";
import type {
  CategoryWithProductCount,
  DashboardProduct,
  DashboardProductsCount,
  DashboardStats,
} from "@/types/dashboard";

/**
 * The response as received, before normalisation.
 *
 * Every field stays optional and the counters stay `unknown` even though a
 * real `200` has now been inspected: the shape is confirmed for today, not
 * guaranteed for every future deploy, and a missing key here should produce an
 * empty list or a zero rather than a `TypeError` halfway through rendering.
 */
interface RawDashboardStats {
  products_count?: Partial<Record<keyof DashboardProductsCount, unknown>>;
  products_by_category?: Category[];
  low_stock_products?: DashboardProduct[];
  latest_products?: DashboardProduct[];
}

/** Coerces a documented integer, falling back to 0 for anything unusable. */
function toCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * The docs promise `products_count` is a real integer here, but it is
 * `number | null` on `Category` everywhere else, so it is coerced rather than
 * cast — a cast would only silence the type checker while `null` still
 * reached the chart.
 */
function withProductCount(category: Category): CategoryWithProductCount {
  return { ...category, products_count: toCount(category.products_count) };
}

/**
 * `GET /api/dashboard/stats` — **admin only**.
 *
 * Note this is stricter than the rest of the admin surface: `manager` can
 * write categories and products but is rejected here, so a manager session
 * gets a 403 on the dashboard while the pages it links to still work.
 *
 * Errors: `401` not signed in, `403` signed in but not an admin. Branch on
 * `ApiError.isForbidden`, never on the message — the docs print
 * "The requested resource was not found." for the 403, which reads like a 404
 * and is almost certainly placeholder text rather than what the server sends.
 */
export async function fetchDashboardStats(
  token: string,
): Promise<DashboardStats> {
  try {
    const { data } = await apiClient.get<RawDashboardStats>(
      "/dashboard/stats",
      { headers: authHeader(token) },
    );

    /*
     * The normalisation below turns any missing key into a 0 or an empty list,
     * which keeps the dashboard from crashing — but also means a response in
     * an unexpected shape renders as a brand-new, empty store rather than as a
     * fault. A store with no products still sends `products_count` with zeros
     * in it, so the key being absent entirely says the shape is wrong, not
     * that there is nothing to show.
     */
    if (process.env.NODE_ENV === "development" && !data.products_count) {
      console.warn(
        "[dashboard] /api/dashboard/stats returned no `products_count`. " +
          "The response shape does not match types/dashboard.ts — the numbers " +
          "below will all read 0. Compare the raw response in the network tab.",
      );
    }

    return {
      products_count: {
        total: toCount(data.products_count?.total),
        active: toCount(data.products_count?.active),
        inactive: toCount(data.products_count?.inactive),
      },
      products_by_category: (data.products_by_category ?? []).map(
        withProductCount,
      ),
      low_stock_products: (data.low_stock_products ?? []).map(normalizeProduct),
      latest_products: (data.latest_products ?? []).map(normalizeProduct),
    };
  } catch (error) {
    throw toApiError(error);
  }
}
