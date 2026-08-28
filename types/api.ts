/**
 * Field-level validation messages, keyed by field name. Laravel only sends
 * these on a `422`.
 */
export type ApiValidationErrors = Record<string, string[]>;

/** Every error response from the API has this shape. */
export interface ApiErrorBody {
  message: string;
  errors?: ApiValidationErrors;
}

/** One entry of Laravel's rendered pagination link list. */
export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

/**
 * Laravel's default paginator shape, verified against the live API.
 *
 * Note this is **flat**: `current_page`, `total`, `per_page`, `last_page`,
 * `from` and `to` sit at the top level, NOT nested inside a `meta` object.
 * An earlier version of the API docs showed `{ data, links, meta }`, which
 * does not match what the server actually returns — modelling it that way
 * would make every read of `meta.total` silently undefined.
 */
export interface Paginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
