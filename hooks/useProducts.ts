"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiToken } from "@/hooks/useApiToken";
import { productKeys } from "@/lib/query-keys/products";
import { dashboardKeys } from "@/lib/query-keys/dashboard";
import { ApiError } from "@/lib/api/errors";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  fetchProduct,
  fetchProducts,
  toggleProductActive,
  updateProduct,
} from "@/services/products";
import type { Paginated } from "@/types/api";
import type {
  Product,
  ProductFilters,
  ProductPayload,
  ProductUpdatePayload,
  ToggledProduct,
} from "@/types/product";

/**
 * Paginated product list.
 *
 * `GET /api/products` is public, so — exactly like `useCategories` — this
 * deliberately does **not** wait on Clerk's `isLoaded` and sends no token.
 * Gating it on auth would delay, or on a slow Clerk load visibly stall, the
 * catalogue for shoppers who never sign in. The dashboard uses the same hook;
 * it needs no token either.
 */
export function useProducts(filters: ProductFilters = {}, enabled = true) {
  return useQuery<Paginated<Product>, ApiError>({
    queryKey: productKeys.lists(filters),
    queryFn: () => fetchProducts(filters),
    /*
     * Changing the page or a filter builds a new query key, which would
     * normally drop straight back to a pending state and flash the skeleton
     * over the whole list. Holding the previous page on screen until the next
     * one arrives keeps paging and filtering steady; `isPlaceholderData` tells
     * call sites when what they are showing is the old page.
     */
    placeholderData: keepPreviousData,
    /*
     * Off by default only when a caller explicitly asks. The public grid
     * needs this: filtering by a category slug from the URL first requires
     * the category list to resolve that slug to an id, and firing this query
     * before that resolution lands would show one unfiltered flash of every
     * product.
     */
    enabled,
  });
}

/**
 * Single product, with its `category` and `images`. Public, like the list.
 *
 * Takes an id or a slug — `fetchProduct` accepts either. The admin edit page
 * passes the numeric id, since that never changes; the public product page
 * passes the slug straight from the URL.
 *
 * `initialData` lets a caller that already has the product (the public page
 * fetches it server-side for `generateMetadata`/JSON-LD anyway — see its
 * `page.tsx`) seed the query with it, so this hook starts in a `success`
 * state instead of `pending` on the very first render. That's what gets the
 * actual product content into the server-rendered HTML instead of a
 * skeleton — a plain client-side fetch has nothing to show until it
 * resolves in the browser, which is invisible to any crawler that doesn't
 * execute JavaScript.
 */
export function useProduct(
  idOrSlug: number | string,
  enabled = true,
  initialData?: Product,
) {
  return useQuery<Product, ApiError>({
    queryKey: productKeys.detail(idOrSlug),
    queryFn: () => fetchProduct(idOrSlug),
    initialData,
    enabled:
      enabled &&
      (typeof idOrSlug === "string" ? idOrSlug.length > 0 : Number.isFinite(idOrSlug)),
  });
}

/**
 * The public product grid's data source — loads one page at a time behind a
 * "See more" button rather than the admin's numbered pagination, which suits
 * browsing better than managing.
 *
 * `page` is excluded from the filters type: this hook drives paging itself
 * through `getNextPageParam`, so a caller passing `page` would just be
 * overridden and the mismatch would be confusing to read.
 */
export function usePublicProducts(
  filters: Omit<ProductFilters, "page"> = {},
  enabled = true,
) {
  return useInfiniteQuery<Paginated<Product>, ApiError>({
    queryKey: productKeys.infiniteLists(filters),
    queryFn: ({ pageParam }) => fetchProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    enabled,
  });
}

/**
 * Every dashboard figure is derived from products, so the stats are
 * invalidated alongside them. Without this a create or delete leaves the
 * dashboard showing counts from before the change.
 */
function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: productKeys.all() });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all() });
  };
}

export function useCreateProduct() {
  const { getApiToken } = useApiToken();
  const invalidate = useInvalidateProducts();

  return useMutation<Product, ApiError, ProductPayload>({
    mutationFn: async (payload) => createProduct(await getApiToken(), payload),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const { getApiToken } = useApiToken();
  const invalidate = useInvalidateProducts();

  return useMutation<
    Product,
    ApiError,
    { id: number; payload: ProductUpdatePayload }
  >({
    mutationFn: async ({ id, payload }) =>
      updateProduct(await getApiToken(), id, payload),
    onSuccess: invalidate,
  });
}

/**
 * Flips `is_active`.
 *
 * The response omits `category` and `images`, so it is never written over the
 * cached product. Instead the cached row is patched with just `is_active`,
 * which keeps the table's image and category on screen, and the list is
 * refetched afterwards to resync.
 */
export function useToggleProductActive() {
  const { getApiToken } = useApiToken();
  const queryClient = useQueryClient();

  return useMutation<ToggledProduct, ApiError, number>({
    mutationFn: async (id) => toggleProductActive(await getApiToken(), id),
    onSuccess: async (toggled) => {
      queryClient.setQueryData<Product>(
        productKeys.detail(toggled.id),
        (current) =>
          current ? { ...current, is_active: toggled.is_active } : current,
      );

      // A toggle moves a product between the `active` and `inactive` counters,
      // so the dashboard is stale too.
      await queryClient.invalidateQueries({ queryKey: productKeys.all() });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all() });
    },
  });
}

export function useDeleteProduct() {
  const { getApiToken } = useApiToken();
  const invalidate = useInvalidateProducts();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => deleteProduct(await getApiToken(), id),
    onSuccess: invalidate,
  });
}

/** Removes one image from a product. See the service for primary-image behaviour. */
export function useDeleteProductImage() {
  const { getApiToken } = useApiToken();
  const invalidate = useInvalidateProducts();

  return useMutation<void, ApiError, { productId: number; imageId: number }>({
    mutationFn: async ({ productId, imageId }) =>
      deleteProductImage(await getApiToken(), productId, imageId),
    onSuccess: invalidate,
  });
}
