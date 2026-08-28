import { apiClient, authHeader } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";
import type { Paginated } from "@/types/api";
import type {
  Product,
  ProductFilters,
  ProductPayload,
  ProductUpdatePayload,
  ToggledProduct,
} from "@/types/product";

/**
 * The API returns `category_id` and `stock` as a string on some endpoints and
 * a number on others. Coercing once here, at the boundary, means the rest of
 * the app can rely on `Product` being numeric — instead of every comparison
 * and sum having to remember to wrap the value in `Number()`.
 *
 * Exported because the dashboard endpoint embeds products too, and its
 * `low_stock_products` list is sorted by exactly the field that arrives as a
 * string (see services/dashboard.ts).
 */
export function normalizeProduct<
  T extends { category_id: unknown; stock: unknown },
>(
  product: T,
): T & { category_id: number; stock: number } {
  return {
    ...product,
    category_id: Number(product.category_id),
    stock: Number(product.stock),
  };
}

/**
 * `GET /api/products` — public, like `GET /api/categories`: it serves visitors
 * with no Authorization header at all, so this takes no token. (An earlier
 * reading of the backend docs suggested it required a signed-in user; that is
 * not how the API behaves.)
 *
 * The response is Laravel's flat paginator (see `Paginated` in types/api.ts),
 * NOT `{ data, meta }`.
 */
export async function fetchProducts(
  filters: ProductFilters = {},
): Promise<Paginated<Product>> {
  try {
    const { data } = await apiClient.get<Paginated<Product>>("/products", {
      params: filters,
    });

    return { ...data, data: data.data.map(normalizeProduct) };
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `GET /api/products/{id-or-slug}` — public, like the list above. Returns the
 * product with its `category` and `images`.
 *
 * Confirmed to accept either form: `/products/3` and `/products/gold-rings`
 * both resolve to the same row. The public product page uses the slug
 * directly (that is what is in the URL); the admin edit page still passes the
 * numeric id since that never changes even if the slug does.
 */
export async function fetchProduct(idOrSlug: number | string): Promise<Product> {
  try {
    const { data } = await apiClient.get<Product>(`/products/${idOrSlug}`);
    return normalizeProduct(data);
  } catch (error) {
    throw toApiError(error);
  }
}

/** Builds the multipart body shared by create and update. */
function toProductFormData(payload: ProductUpdatePayload): FormData {
  const form = new FormData();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    form.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  };

  append("category_id", payload.category_id);
  append("slug", payload.slug);
  append("name_ar", payload.name_ar);
  append("name_en", payload.name_en);
  append("description_ar", payload.description_ar);
  append("description_en", payload.description_en);
  append("gold_weight", payload.gold_weight);
  append("karat", payload.karat);
  append("gemstone_type", payload.gemstone_type);
  append("gemstone_carat", payload.gemstone_carat);
  append("price", payload.price);
  /*
   * `append` drops `null` and `undefined`, so a discount is removed by sending
   * `has_discount: false` and letting the server clear the value — there is no
   * way to push an explicit null through this body. If the server turns out to
   * keep the old `discount_value` after that, send `discount_value: 0` from the
   * caller instead of special-casing it here.
   */
  append("has_discount", payload.has_discount);
  append("discount_value", payload.discount_value);
  append("stock", payload.stock);
  append("is_active", payload.is_active);

  // The field name must be exactly `images[]`, brackets included. Sending it
  // as `images` makes Laravel read a single value instead of an array and
  // reject the request with 422 "The images field must be an array." — even
  // when several files share the name.
  payload.images?.forEach((file) => form.append("images[]", file));

  return form;
}

/** `POST /api/products` — admin (backend also allows manager). */
export async function createProduct(
  token: string,
  payload: ProductPayload,
): Promise<Product> {
  try {
    const { data } = await apiClient.post<Product>(
      "/products",
      toProductFormData(payload),
      { headers: authHeader(token) },
    );
    return normalizeProduct(data);
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `PUT /api/products/{id}` — sent as POST + `_method=PUT`, for the same PHP
 * multipart limitation described in services/categories.ts.
 *
 * Any `images[]` sent here are **added** to the product's existing images,
 * never a replacement for them. Removing one requires
 * `deleteProductImage()`.
 */
export async function updateProduct(
  token: string,
  id: number,
  payload: ProductUpdatePayload,
): Promise<Product> {
  try {
    const form = toProductFormData(payload);
    form.append("_method", "PUT");

    const { data } = await apiClient.post<Product>(`/products/${id}`, form, {
      headers: authHeader(token),
    });
    return normalizeProduct(data);
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `PATCH /api/products/{id}/toggle-active` — flips `is_active`. Takes no body.
 *
 * Returns a partial product with no `category` and no `images`, which is why
 * the return type is `ToggledProduct`: writing this response over a cached
 * `Product` would wipe those fields from the UI. Use only its `is_active`.
 */
export async function toggleProductActive(
  token: string,
  id: number,
): Promise<ToggledProduct> {
  try {
    const { data } = await apiClient.patch<ToggledProduct>(
      `/products/${id}/toggle-active`,
      undefined,
      { headers: authHeader(token) },
    );
    return normalizeProduct(data);
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `DELETE /api/products/{id}` — admin only. Also deletes the product's images
 * from Cloudinary. Irreversible.
 */
export async function deleteProduct(token: string, id: number): Promise<void> {
  try {
    await apiClient.delete(`/products/${id}`, { headers: authHeader(token) });
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `DELETE /api/products/{id}/images/{imageId}` — removes a single image.
 * `imageId` is the image's own id, not its position.
 *
 * If the deleted image was the primary one, the next image by `sort_order`
 * is promoted automatically. There is no endpoint to choose a primary image
 * or reorder images, so that ordering is only ever a consequence of upload
 * and deletion order.
 */
export async function deleteProductImage(
  token: string,
  productId: number,
  imageId: number,
): Promise<void> {
  try {
    await apiClient.delete(`/products/${productId}/images/${imageId}`, {
      headers: authHeader(token),
    });
  } catch (error) {
    throw toApiError(error);
  }
}
