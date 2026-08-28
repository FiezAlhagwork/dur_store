export interface Category {
  id: number;
  /** Ready-to-use Cloudinary URL, or null when the category has no image. */
  image: string | null;
  name_ar: string;
  name_en: string;
  /** Unique across all categories. */
  slug: string;
  is_active: boolean;
  /**
   * Only returned by `GET /api/dashboard/stats`. Absent everywhere else, so
   * never render it without a fallback.
   */
  products_count?: number | null;
}

export interface ProductImage {
  id: number;
  /** Ready-to-use Cloudinary URL. */
  path: string;
  sort_order: number;
  is_primary: boolean;
}

/**
 * The API stores karat as a **string**, and rejects anything outside this set
 * with a 422 — so any karat input has to be a select, never a free text field.
 */
export type Karat = "18" | "21" | "22" | "24";

export const KARAT_OPTIONS: readonly Karat[] = ["18", "21", "22", "24"];

/**
 * The discount actually in force on a product, as the API describes it.
 *
 * Observed in full on one real response:
 * ```json
 * { "source": "product", "type": "percentage", "value": 15, "amount": 118.5,
 *   "promotion_id": null, "name_ar": null, "name_en": null, "ends_at": null }
 * ```
 *
 * The last four fields say there is a promotions system behind this that the
 * app has not met yet — a discount can come from the product itself
 * (`source: "product"`, everything promotion-shaped null) or, presumably, from
 * a named campaign with an end date. Only the product case has ever been seen,
 * so `source` and `type` are widened with `(string & {})`: the known values get
 * autocomplete without the type claiming the list is exhaustive.
 */
export interface ProductDiscount {
  source: "product" | (string & {});
  type: "percentage" | (string & {});
  /** The raw configured number — a percentage when `type` is `"percentage"`. */
  value: number;
  /** The money taken off, computed server-side. Always a currency amount, whatever `type` is. */
  amount: number;
  promotion_id: number | null;
  name_ar: string | null;
  name_en: string | null;
  /** ISO timestamp, when the discount comes from a campaign that expires. */
  ends_at: string | null;
}

export interface Product {
  id: number;
  /** Unique across all products. */
  slug: string;
  /**
   * The API returns this as a string on some endpoints and a number on
   * others; the service layer normalises it to a number before it ever
   * reaches the app (see services/products.ts).
   */
  category_id: number;
  /** Eager-loaded on every product endpoint except `toggle-active`. */
  category?: Category;

  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;

  gold_weight: number | null;
  karat: Karat;

  gemstone_type: string | null;
  gemstone_carat: number | null;

  /** The undiscounted price. Always present, discount or not. */
  price: number;

  /** Whether a discount is currently applied. */
  has_discount: boolean;
  /**
   * The number the admin entered — **not** a price.
   *
   * Confirmed against a real response: for a product-level discount the API
   * reads this as a **percentage**. Setting `15` on a $790 product returned
   * `final_price: 671.5` and `discount.type: "percentage"`.
   *
   * Read `discount.type` rather than assuming, wherever both are available:
   * the API names the type explicitly, which implies other types exist. This
   * field is only ever *written* as a percentage, because that is what the
   * product update body supports.
   */
  discount_value: number | null;
  /** What the customer actually pays. Computed server-side; equals `price` when there is no discount. */
  final_price: number;
  /** The applied discount, or `null` when there is none. */
  discount: ProductDiscount | null;

  /** Normalised to a number by the service layer, like `category_id`. */
  stock: number;
  is_active: boolean;

  images: ProductImage[];

  created_at: string;
  updated_at: string;
}

/**
 * What `PATCH /api/products/{id}/toggle-active` actually returns: the product
 * **without** `category` or `images`. Deliberately typed as its own shape so
 * it cannot be mistaken for a full `Product` and used to overwrite a cached
 * row (which would blank out the image and category in the UI).
 */
export type ToggledProduct = Omit<
  Product,
  // The discount fields are omitted for the same reason, one step further on:
  // it is not confirmed whether this endpoint returns them at all. Only `id`
  // and `is_active` are ever read from this response, so claiming the rest
  // would be asserting something unverified.
  "category" | "images" | "has_discount" | "discount_value" | "final_price" | "discount"
>;

export interface CategoryFilterOption {
  id: number | "all";
  label: string;
}

export interface CategoryFiltersProps {
  options: CategoryFilterOption[];
  activeId: number | "all";
  onChange: (id: number | "all") => void;
}

export interface ProductCardProps {
  product: Product;
}

/** Query-string filters accepted by `GET /api/products`. All optional. */
export interface ProductFilters {
  category_id?: number;
  is_active?: boolean;
  search?: string;
  /** Defaults to 15 server-side. */
  per_page?: number;
  page?: number;
}

/**
 * Body for creating a category. Sent as `multipart/form-data` because of the
 * optional image (max 4MB).
 */
export interface CategoryPayload {
  name_ar: string;
  name_en: string;
  slug: string;
  image?: File | null;
  is_active?: boolean;
}

/** Same fields as `CategoryPayload`, but every one is optional on update. */
export type CategoryUpdatePayload = Partial<CategoryPayload>;

/**
 * Body for creating a product. `images` becomes the `images[]` form field —
 * see services/products.ts for why the brackets matter.
 */
export interface ProductPayload {
  category_id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  gold_weight?: number;
  karat?: Karat;
  gemstone_type?: string;
  gemstone_carat?: number;
  price: number;
  has_discount?: boolean;
  /** Sent as-is; see the note on `Product.discount_value`. */
  discount_value?: number;
  stock?: number;
  is_active?: boolean;
  images?: File[];
}

/**
 * Every field optional on update. Leave `slug` out unless it actually
 * changed: it is not confirmed that the server excludes the current row from
 * its uniqueness check, so re-sending the existing slug risks a spurious 422.
 */
export type ProductUpdatePayload = Partial<ProductPayload>;
