"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/hooks/useApiToken";
import { categoryKeys } from "@/lib/query-keys/categories";
import { productKeys } from "@/lib/query-keys/products";
import { dashboardKeys } from "@/lib/query-keys/dashboard";
import { ApiError } from "@/lib/api/errors";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategory,
  updateCategory,
} from "@/services/categories";
import type {
  Category,
  CategoryPayload,
  CategoryUpdatePayload,
} from "@/types/product";

/**
 * `GET /api/categories` is public, so this deliberately does **not** wait on
 * Clerk's `isLoaded` and sends no token. Gating it on auth would delay — or
 * on a slow Clerk load, visibly stall — the category list for anonymous
 * shoppers who never need to sign in to browse.
 */
export function useCategories() {
  return useQuery<Category[], ApiError>({
    queryKey: categoryKeys.lists(),
    queryFn: () => fetchCategories(),
  });
}

/** Single category. Public, like `useCategories`. */
export function useCategory(id: number, enabled = true) {
  return useQuery<Category, ApiError>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: enabled && Number.isFinite(id),
  });
}

/**
 * Invalidating `categoryKeys.all()` after a write refreshes every category
 * list and detail at once, so no call site has to know which specific keys a
 * change affects.
 *
 * The dashboard goes with it: its `products_by_category` breakdown is keyed on
 * categories, so a rename or a new category leaves that chart wrong otherwise.
 */
function useInvalidateCategories() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: categoryKeys.all() });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all() });
  };
}

export function useCreateCategory() {
  const { getApiToken } = useApiToken();
  const invalidate = useInvalidateCategories();

  return useMutation<Category, ApiError, CategoryPayload>({
    mutationFn: async (payload) => createCategory(await getApiToken(), payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const { getApiToken } = useApiToken();
  const invalidate = useInvalidateCategories();

  return useMutation<
    Category,
    ApiError,
    { id: number; payload: CategoryUpdatePayload }
  >({
    mutationFn: async ({ id, payload }) =>
      updateCategory(await getApiToken(), id, payload),
    onSuccess: invalidate,
  });
}

/**
 * Deleting a category cascades to every product inside it, so callers must
 * confirm with the user before firing this.
 *
 * Product queries are invalidated too, since rows in them just disappeared.
 */
export function useDeleteCategory() {
  const { getApiToken } = useApiToken();
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => deleteCategory(await getApiToken(), id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all() });
      await queryClient.invalidateQueries({ queryKey: productKeys.all() });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all() });
    },
  });
}
