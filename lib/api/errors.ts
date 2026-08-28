import axios from "axios";
import type { ApiErrorBody, ApiValidationErrors } from "@/types/api";

/**
 * One error type for every API call, instead of a separate class per entity
 * (`UserFetchError`, `ProductFetchError`, …). Retry policy, redirect-on-401
 * and validation display are all written once against this shape.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Field-level messages. Only present on a 422. */
  readonly errors?: ApiValidationErrors;

  constructor(status: number, message: string, errors?: ApiValidationErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** True when the server rejected the payload rather than the request. */
  get isValidation(): boolean {
    return this.status === 422;
  }

  /**
   * True when the session is valid but lacks the role the endpoint requires —
   * signing in again would change nothing.
   *
   * Branch on this, never on the message. `GET /api/dashboard/stats` documents
   * its 403 body as "The requested resource was not found.", wording that
   * belongs to a 404 and is almost certainly placeholder text from the docs
   * generator. The status code is the only dependable signal.
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** First message for a field, e.g. to feed react-hook-form's setError. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

/**
 * Normalises anything thrown by axios into an `ApiError`.
 *
 * `status` is `0` when the request never produced a response at all (network
 * down, DNS failure, CORS, timeout) — that is deliberately distinct from any
 * real HTTP status so the retry policy can treat it as retryable while still
 * never retrying a 401.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const { response } = error;

    if (!response) {
      return new ApiError(0, error.message || "Network request failed");
    }

    return new ApiError(
      response.status,
      response.data?.message || error.message || `Request failed with status ${response.status}`,
      response.data?.errors,
    );
  }

  return new ApiError(0, error instanceof Error ? error.message : "Unknown error");
}
