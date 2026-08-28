import { apiClient, authHeader } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";
import type {
  Category,
  CategoryPayload,
  CategoryUpdatePayload,
} from "@/types/product";

/**
 * `GET /api/categories` — public, verified to work with no Authorization
 * header at all, so this takes no token.
 *
 * Returns every category in one go; the endpoint is not paginated.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data } = await apiClient.get<Category[]>("/categories");
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** `GET /api/categories/{id}` — public, like the list above. */
export async function fetchCategory(id: number): Promise<Category> {
  try {
    const { data } = await apiClient.get<Category>(`/categories/${id}`);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** Builds the multipart body shared by create and update. */
function toCategoryFormData(payload: CategoryUpdatePayload): FormData {
  const form = new FormData();

  if (payload.name_ar !== undefined) form.append("name_ar", payload.name_ar);
  if (payload.name_en !== undefined) form.append("name_en", payload.name_en);
  if (payload.slug !== undefined) form.append("slug", payload.slug);
  if (payload.is_active !== undefined) {
    form.append("is_active", payload.is_active ? "1" : "0");
  }
  if (payload.image) form.append("image", payload.image);

  return form;
}

/** `POST /api/categories` — admin (backend also allows manager). */
export async function createCategory(
  token: string,
  payload: CategoryPayload,
): Promise<Category> {
  try {
    const { data } = await apiClient.post<Category>(
      "/categories",
      toCategoryFormData(payload),
      { headers: authHeader(token) },
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `PUT /api/categories/{id}` — sent as a POST carrying `_method=PUT`.
 *
 * PHP cannot parse a `multipart/form-data` body on a real PUT request, so
 * Laravel's method-override field is the only way to send one. `_method` must
 * be a plain text field; adding it as a file makes the route reject the call
 * with "The POST method is not supported for route …".
 *
 * A new image **replaces** the existing one — categories hold a single image,
 * unlike products where uploads are additive.
 */
export async function updateCategory(
  token: string,
  id: number,
  payload: CategoryUpdatePayload,
): Promise<Category> {
  try {
    const form = toCategoryFormData(payload);
    form.append("_method", "PUT");

    const { data } = await apiClient.post<Category>(`/categories/${id}`, form, {
      headers: authHeader(token),
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * `DELETE /api/categories/{id}` — admin only.
 *
 * Destructive and irreversible: it cascades and deletes every product in the
 * category. Callers must confirm with the user first.
 */
export async function deleteCategory(
  token: string,
  id: number,
): Promise<void> {
  try {
    await apiClient.delete(`/categories/${id}`, { headers: authHeader(token) });
  } catch (error) {
    throw toApiError(error);
  }
}
